import { PG_KEYWORD, PG_KEYWORDS, TYPE } from './kwlist';
import { parseStmt } from './parse-stmt';
import { tokenize } from './tokenize';
import { Stmt, Token, TokenType } from './types';

export declare type Variable = {
    keyword: PG_KEYWORD;
    type: 'PARAMETER' | 'DECLARATION';
};

/**
 * Parses a SQL script into a statement tree.
 * @param script The plain text of a SQL script
 */
export const parse = (script: string, path?: string) => {
    const stmts: (Stmt | Token)[] = [];

    const pushToken = (token: Token, children?: (Stmt | Token)[]) => {
        stmts.push({
            type: token.type,
            value: token.value,
            position: token.position,
            children: children
        });
    };

    const tokens = tokenize(script);
    const vars: Record<string, Variable[]> = {};
    let token: Token | undefined;

    while ((token = tokens.shift())) {
        if (token.type === TokenType.KEYWORD) {
            const keyword = PG_KEYWORDS.getIfExists(token.value);

            if (keyword.type === TYPE.COMMAND) {
                pushToken(token, parseStmt({ tokens, vars, script, path }));
                continue;
            }
        }

        stmts.push(token);
    }

    console.log(vars);

    return stmts;
};
