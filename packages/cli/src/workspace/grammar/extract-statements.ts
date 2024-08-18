import { __ } from '../parsers/util.js';
import { Token } from './pg-tokenizer.js';

/**
 * Extracts stmts from an array of keywords
 * @param tokens An array of pg tokens
 * @param keywords The order of keywords as they appear in a statement
 * @returns A record of keywords mapped to tokens in its stmt
 */
export function extractStmtByKeyword<T extends string>(
    tokens: Token[],
    keywords: T[]
): Partial<Record<T, Token[]>> {
    const stmts: Partial<Record<T, Token[]>> = {};
    const _tokens = tokens.map((t) => __(t.value));

    const kw = keywords.findIndex((kw) => _tokens.includes(kw));
    if (kw === -1) stmts;

    const firstToken = _tokens.findIndex((token) => token === keywords[kw]);
    if (firstToken === -1) stmts;

    tokens = tokens.slice(firstToken);

    let currentKw: keyof typeof stmts = keywords[kw];
    let token: Token | undefined;

    while ((token = tokens.shift())) {
        if (token.value === ';') return stmts;

        const isKw = keywords.indexOf(<T>__(token.value));

        if (isKw === -1) {
            stmts[currentKw]?.push(token);
            continue;
        }

        currentKw = keywords[isKw];
        stmts[currentKw] ??= [];
        stmts[currentKw]?.push(token);
    }

    return stmts;
}
