import { __ } from '../parsers/util.js';
import { Token } from './pg-tokenizer.js';
import { RegExpArray } from './reg-exp-arr.js';

/**
 * Extracts stmts from an array of keywords
 * @param tokens An array of pg tokens
 * @param keywords The order of keywords as they appear in a statement
 * @returns A record of keywords mapped to tokens in its stmt
 */
export function extractStmtByKeyword<T extends string>(
    tokens: Token[],
    keywords: T[],
    // @ts-ignore
    source: string,
    // @ts-ignore
    path: string
): Partial<Record<T, Token[]>> {
    const stmts: Partial<Record<T, Token[]>> = {};

    const $keywords = new RegExpArray(...keywords);

    let token: Token | undefined;
    while ((token = tokens.shift())) {
        const tokenVal = token.value;
        const kwIndex = $keywords.findIndex((kw) => kw.$entry.test(tokenVal));
        if (kwIndex === -1) continue;
        const nextKeywords = $keywords.slice(kwIndex);

        const kw = $keywords[kwIndex];
        const stmt = concatSchema(nextKeywords, token.position);
        stmts[<T>kw.entry] = stmt;
    }

    return stmts;

    function concatSchema(
        nextKeywords: RegExpArray,
        // @ts-ignore
        position: number
    ) {
        const stmt: Token[] = [];

        while ((token = tokens.shift())) {
            const tokenVal = token.value;

            if (!nextKeywords.find((nkw) => nkw.$entry.test(tokenVal))) {
                stmt.push(token);
                continue;
            }

            if (token.value === ';') {
                stmt.push(token);
                return stmt;
            }

            tokens.unshift(token);
            return stmt;
        }

        return stmt;
    }
}

/**
 * console.error(
            new PgSyntaxError(
                'Unterminated statement.',
                source,
                position,
                path
            ).prettyPrint()
        );
 */
