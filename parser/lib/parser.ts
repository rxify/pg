import { Pattern, PatternSegment } from './patterns.js';
import { PgSyntaxError } from './error.js';
import { Token, TokenType } from './types.js';

/**
 * Lowercases a token's value.
 */
const _ = (node: Token) => {
    return node.value.toLowerCase();
};

class Test {
    /**
     * Safely assert that the value or type of `node` matches
     * the expected value or type.
     * @param expectedValOrType An expected value or token type
     * @param node A node whose value or type will be tested
     * @returns `true` if the expected value or type is received;
     * otherwise, `false`.
     */
    static it(expectedValOrType: string | TokenType, node: Token) {
        if (typeof expectedValOrType === 'string') {
            return Test.val(expectedValOrType, node);
        }

        return Test.type(expectedValOrType, node);
    }

    /**
     * Safely assert that the value `node` matches
     * the expected value.
     * @param expectedVal An expected value
     * @param node The node that holds the actual value
     * @returns True if  `expectedVal` matches `node.value`
     */
    static val(expectedVal: string, node: Token) {
        return _(node) === expectedVal.toLowerCase();
    }

    /**
     * Safely assert that the type of `node` matches
     * the expected type.
     * @param expectedType An expected type
     * @param node The node that holds the actual type
     * @returns True if `expected` matches `node.type`
     */
    static type(expectedType: TokenType, node: Token) {
        return node.type === expectedType;
    }
}

/**
 * Parses the nodes of a raw SQL file into a tree.
 * @param nodes A flat array of nodes, scanned with `scan`.
 * @param sql The raw sql, for error reporting purposes
 * @param path The path to the local sql, for error reporting purposes
 * @returns The nodes parsed into a tree
 */
export const parse = (nodes: Token[], sql: string, path: string) => {
    let node: Token | undefined;
    let tree: Token[] = [];

    const shift = (expected: string | TokenType, lastNode: Token) => {
        const next = nodes.shift();
        if (!next)
            throw Err.null(
                typeof expected === 'string' ? expected : TokenType[expected],
                lastNode.position
            );
        return next;
    };

    class Err {
        static match(
            expected: string | TokenType,
            received: string | TokenType,
            position: number | Token
        ) {
            const exp =
                typeof expected === 'string' ? expected : TokenType[expected];
            const rec =
                typeof received === 'string' ? received : TokenType[received];

            return Err.msg(`Expected ${exp}, received ${rec}`, position);
        }

        static null(expected: string, position: number | Token) {
            return Err.msg(
                `Expected ${expected}, received undefined.`,
                position
            );
        }

        static msg(message: string, position: number | Token) {
            if (typeof position !== 'number') {
                position = position.position + position.value.length;
            }

            return new PgSyntaxError(message, path, sql, position);
        }
    }

    class Expect {
        static optionalSequence(
            parent: Token,
            sequence: (string | TokenType)[]
        ) {
            const returnTokens: Token[] = [];

            let firstToken = true;
            let next: Token;
            for (let expected of sequence) {
                next = shift(expected, parent);

                if (firstToken) {
                    if (!Test.it(expected, next)) {
                        nodes.unshift(next);
                        return <Token[]>[];
                    }

                    firstToken = false;
                } else if (!Test.it(expected, next)) {
                    throw Err.match(expected, next.value, next.position);
                }

                returnTokens.push(next);
            }

            return returnTokens;
        }

        static oneOf(parent: Token, expected: (string | PatternSegment)[]) {
            const next = shift(expected.join(' | '), parent);

            for (let val of expected) {
                if (typeof val === 'string') {
                    if (Test.val(val, next)) return next;
                } else {
                    // TODO PatternSegment
                }
            }

            throw Err.match(expected.join(' | '), next.value, next.position);
        }

        static it(parent: Token, expected: TokenType | string) {
            if (typeof expected === 'string') {
                return this.value(parent, expected);
            }

            return this.type(parent, expected);
        }

        static type(parent: Token, expected: TokenType) {
            const next = shift('string', parent);

            if (!Test.type(expected, next)) {
                throw Err.match(
                    TokenType[expected],
                    TokenType[next.type],
                    next
                );
            }

            return next;
        }

        static value(parent: Token, expected: string) {
            const next = shift('string', parent);

            if (!Test.val(expected, next)) {
                throw Err.match(expected, next.value, next);
            }

            return next;
        }
    }

    class Parse {
        static pattern(root: Token, { pattern }: Pattern) {
            if (!pattern) return <Token[]>[];
            pattern.forEach((segments) => {
                root.children ??= [];
                root.children.push(...this.patternSegment(root, segments));
            });

            return pattern.flatMap((ps) => this.patternSegment(root, ps));
        }

        static patternSegment(
            parent: Token,
            {
                type,
                value,
                oneOf,
                optionalSequence,
                children,
                child,
                optional
            }: PatternSegment
        ): Token[] {
            parent.children ??= [];

            let childTokens: Token[] | undefined;
            let next = shift(parent.type ?? parent.value ?? '?', parent);

            try {
                if (optionalSequence) {
                    return Expect.optionalSequence(next, optionalSequence);
                }

                if (oneOf) {
                    return [Expect.oneOf(next, oneOf)];
                }

                if (children) {
                    childTokens = [];
                    children.forEach((child) => {
                        childTokens?.push(...this.patternSegment(next, child));
                        next = shift(child.type ?? child.value ?? '?', parent);
                    });
                    return childTokens;
                }

                if (child) {
                    return this.patternSegment(next, child);
                }

                if (type) {
                    return [Expect.type(next, type)];
                }

                if (value) {
                    return [Expect.value(next, value)];
                }

                throw new Error('Invalid pattern segment');
            } catch (error) {
                if (optional) {
                    nodes.unshift(next);
                    return <Token[]>[];
                }

                throw error;
            }
        }

        static create(create: Token) {
            const orReplace = Expect.optionalSequence(create, [
                'or',
                'replace'
            ]);
            const type = Expect.oneOf(create, [
                'aggregate',
                'conversion',
                'database',
                'domain',
                'function',
                'group',
                'language',
                'operator class',
                'operator',
                'rule',
                'schema',
                'sequence',
                'table',
                'tablespace',
                'trigger',
                'type',
                'user',
                'view'
            ]);
            type.children = [Expect.type(create, TokenType.STRING)];

            create.children = [...orReplace, type];

            return [create];
            // const results = this.pattern(create, createPattern);
            // return results;
        }
    }

    /**
     * Build a statement tree.
     * @param parent A node of type
     * @returns The root node of a statement
     */
    function parseStmt(parent: Token) {
        parent.children ??= [];

        let next: Token | undefined;

        while ((next = nodes.shift())) {
            if (next.keyword) {
                switch (next.value.toLowerCase()) {
                    case 'create':
                        parent.children.push(...Parse.create(next));
                        continue;
                    case 'declare':
                        parent.children.push(parseStmt(next));
                        continue;
                    case 'begin':
                        if (Test.val('declare', parent)) {
                            nodes.unshift(next);
                            return parent;
                        }
                        parent.children.push(parseStmt(next));
                        continue;
                    case 'end':
                        parent.children.push(next);

                        const lookead = nodes.shift();
                        if (!lookead) throw Err.null('?', next.position);

                        // special case: END IF
                        if (Test.val('if', lookead)) {
                            parent.children.push(lookead);
                        } else {
                            nodes.unshift(lookead);
                        }

                        return parent;
                }
            }

            if (Test.val('(', next)) {
                parent.children.push(parseStmt(next));
                continue;
            }

            if (Test.val(')', next)) {
                parent.children.push(next);
                return parent;
            }

            parent.children.push(next);
        }

        return parent;
    }

    while ((node = nodes.shift())) {
        if (node.keyword) {
            if (Test.val('create', node)) {
                tree.push(...Parse.create(node));
                continue;
            }

            if (Test.val('declare', node)) {
                tree.push(parseStmt(node));
                continue;
            }

            if (Test.val('end', node)) {
                tree.push(node);

                const lookead = nodes.shift();
                if (!lookead) throw Err.null('?', node.position);

                // END IF
                if (Test.val('if', lookead)) {
                    tree.push(lookead);
                } else {
                    nodes.unshift(lookead);
                }
            }

            tree.push(parseStmt(node));
            continue;
        }

        if (Test.type(TokenType.COMMENT, node)) {
            tree.push(node);
            continue;
        }

        tree.push(node);
    }

    return tree;
};
