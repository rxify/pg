import { PG_KEYWORDS } from './kwlist';
import { Variable } from './parse';
import { PgSyntaxError } from './syntax-error';
import { Stmt, Token, TokenType } from './types';

export declare type OrphanAction = 'CONSUME_ORPHAN' | 'UNSHIFT_ORPHAN';

/**
 * Parses individual SQL statements.
 * @param tokens Tokens parsed from a SQL script
 * @returns An array of statements, each of can have _n_
 * sub-statements.
 */
export const parseStmt = ({
    tokens,
    vars,
    script,
    path,
    returnOn,
    parent
}: {
    tokens: Token[];
    vars: Record<string, Variable[]>;
    script: string;
    path?: string;
    returnOn?: string | TokenType;
    parent?: Token;
}) => {
    const stmts: (Stmt | Token)[] = [];

    const syntaxError = new PgSyntaxError({
        script,
        path
    });

    let token: Token | undefined;

    while ((token = tokens.shift())) {
        if (isType(TokenType.PUNCT, token)) {
            stmts.push(token);
            if (isVal(';', token) && returnOn === ';') return stmts;
            continue;
        }

        /**
         * `KEYWORD`
         */
        if (isType(TokenType.KEYWORD, token)) {
            /**
             * Handles function parameter declarations.
             * @example
             * (
             *    IN var_1 TYPE,
             *    IN var_n TYPE
             * )
             */
            if (isVal('in', token)) {
                pushSubStmt(token, parseFnDec(token));
                continue;
            }

            if (isVal('declare', token)) {
                pushSubStmt(token, parseDeclare(token));
                continue;
            }

            if (isVal('if', token)) {
                pushSubStmt(
                    token,
                    parseStmt({
                        tokens,
                        vars,
                        script,
                        path,
                        parent: token
                    })
                );
                continue;
            }

            if (isVal('else', token)) {
                pushSubStmt(
                    token,
                    parseStmt({ tokens, vars, script, path, parent })
                );
                return stmts;
            }

            if (isVal('begin', token)) {
                pushSubStmt(
                    token,
                    parseStmt({
                        tokens,
                        vars,
                        script,
                        parent: token,
                        path
                    })
                );
                return stmts;
            }

            /**
             * @example
             * END IF;
             * BEGIN ... END ...
             */
            if (isVal('end', token)) {
                let next = tokens.shift();

                const isInIF = isVal('if', parent);

                if (!next) {
                    if (isInIF) {
                        throw syntaxError.fork({
                            expected: 'IF',
                            position: token.position
                        });
                    }

                    throw syntaxError.fork({
                        expected: '; | function definition',
                        position: token.position
                    });
                }

                const isIF = isVal('if', next);

                if (isInIF && !isIF) {
                    throw syntaxError.fork({
                        expected: 'IF',
                        received: next.value,
                        position: next.position
                    });
                }

                if (isIF) {
                    stmts.push(token, next);
                    return stmts;
                }

                // @todo - it's now not separating out individual statements

                if (isVal('begin', parent)) {
                    stmts.push(token, next);

                    let end: Token | undefined;
                    while ((end = tokens.shift())) {
                        stmts.push(end);
                        if (end.value === ';') {
                            return stmts;
                        }
                    }

                    throw syntaxError.fork({
                        expected: ';',
                        position: next.position
                    });
                }

                tokens.unshift(next);
                continue;
            }

            /**
             * Handles `EXECUTE` command
             * @example
             * EXECUTE 'myDynamicSQL' ... ;
             */
            if (isVal('execute', token)) {
                pushSubStmt(
                    token,
                    parseStmt({
                        tokens,
                        vars,
                        script,
                        path,
                        returnOn: ';'
                    })
                );
                continue;
            }

            /**
             * Handles `USING` in dynamic SQL execution.
             * @example
             * EXECUTE 'myDynamicSql' USING $1 ... $n;
             */
            if (isVal('using', token)) {
                pushSubStmt(
                    token,
                    consume().until((token) => token.value === ';')
                );
                continue;
            }

            pushSubStmt(token);
            continue;
        }

        if (isType(TokenType.GROUP_OPEN, token)) {
            pushSubStmt(token, parseStmt({ tokens, vars, script, path }));
            continue;
        }

        if (isType(TokenType.GROUP_CLOSE, token)) {
            pushSubStmt(token);
            return stmts;
        }

        stmts.push(token);
    }

    function pushSubStmt(token: Token, children?: (Stmt | Token)[]) {
        stmts.push(createSubStmt(token, children));
    }

    function parseDeclare(declare: Token) {
        const children: (Token | Stmt)[] = [];

        const parseDeclareLn = (fnName: Token) => {
            vars[fnName.value] = [];

            let type = consume().until(
                (token) => token.type !== TokenType.KEYWORD
            );
            let aft = consume().until(
                (token) => token.value === ';',
                'CONSUME_ORPHAN'
            );

            vars[fnName.value] = type.map((type) => ({
                keyword: PG_KEYWORDS.getIfExists(type.value),
                type: 'DECLARATION'
            }));

            return createSubStmt(fnName, [...type, ...aft]);
        };

        let next: Token | undefined;
        while ((next = tokens.shift())) {
            if (isVal('begin', next)) {
                tokens.unshift(next);
                return children;
            }

            children.push(parseDeclareLn(next));
        }

        throw syntaxError.fork({
            expected: 'BEGIN',
            position: declare.position
        });
    }

    function parseFnDec(inn: Token) {
        const children: (Token | Stmt)[] = [];

        let next = tokens.shift();

        if (!next) {
            throw syntaxError.fork({
                position: inn.position,
                expected: 'a variable name'
            });
        }

        if (!isType(TokenType.WORD, next)) {
            throw syntaxError.fork({
                position: next.position,
                expected: TokenType.WORD,
                received: next.type
            });
        }

        const varname = next.value;
        vars[varname] = [];

        while ((next = tokens.shift())) {
            /**
             * Groups within function declarations
             * @example
             * IN var_name NUMERIC ( 4 )
             * IN var_name CHARACTER VARYING ( 50 )
             */
            if (next.value === '(') {
                children.push(
                    createSubStmt(
                        next,
                        consume().until(
                            (token) => token.value === ')',
                            'CONSUME_ORPHAN'
                        )
                    )
                );
                continue;
            }

            if (isType(TokenType.KEYWORD, next)) {
                const type = consume(next).while((token) =>
                    isType(TokenType.KEYWORD, token)
                );

                vars[varname] = type.map((token) => ({
                    keyword: PG_KEYWORDS.getIfExists(token.value),
                    type: 'PARAMETER'
                }));

                children.push(...type);
                continue;
            }

            /**
             * Inner lines of function parameter declarations
             * @example
             * IN var_1 TYPE,
             */
            if (next.value === ',') {
                children.push(next);
                return children;
            }

            /**
             * Final line of function parameter declarations
             * @example
             * ( IN var_type TYPE )
             */
            if (next.value === ')') {
                tokens.unshift(next);
                return children;
            }

            children.push(next);
        }

        throw syntaxError.fork({
            expected: ')',
            position: script.length
        });
    }

    function consume(token = tokens.shift()) {
        return {
            while: (
                evaluate: (token: Token) => boolean,
                orphanAction: OrphanAction = 'UNSHIFT_ORPHAN'
            ) => {
                let children: Token[] = [];

                // Consume tokens until the callback returns false
                while (token && evaluate(token)) {
                    children.push(token);
                    token = tokens.shift();
                }

                // The while loop will shift a token until `evaluate`
                // returns, resulting in an orphaned token
                if (token) {
                    // If `consumeLast` is set to true, push the orphaned
                    // token into `children` and return
                    if (orphanAction === 'CONSUME_ORPHAN') {
                        children.push(token);
                        return children;
                    }

                    // Otherwise, unshift the orphaned token so it can be
                    // evaluated
                    tokens.unshift(token);
                }

                return children;
            },
            /**
             *
             * @param evaluate A callback that evalutes unshifted tokens,
             * returning `true` when `consume` should stop and return
             * @returns
             */
            until: (
                evaluate: (token: Token) => boolean,
                orphanAction: OrphanAction = 'UNSHIFT_ORPHAN'
            ) => {
                let children: Token[] = [];

                // Consume tokens until the callback returns false
                while (token && !evaluate(token)) {
                    children.push(token);
                    token = tokens.shift();
                }

                // The while loop will shift a token until `evaluate`
                // returns, resulting in an orphaned token
                if (token) {
                    // If `consumeLast` is set to true, push the orphaned
                    // token into `children` and return
                    if (orphanAction === 'CONSUME_ORPHAN') {
                        children.push(token);
                        return children;
                    }

                    // Otherwise, unshift the orphaned token so it can be
                    // evaluated
                    tokens.unshift(token);
                }

                // @todo we probably need to throw an error here
                return children;
            }
        };
    }

    return stmts;
};

function isVal(val: string, token?: Token) {
    return val.toUpperCase() === token?.value.toUpperCase();
}

function isType(type: TokenType, token: Token) {
    return type === token?.type;
}

function createSubStmt(token: Token, children?: (Stmt | Token)[]): Stmt {
    return {
        type: token.type,
        value: token.value,
        position: token.position,
        children: children
    };
}
