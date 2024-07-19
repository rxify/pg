import { punctuation, word } from './regexp.js';
import { Token, TokenType } from './types.js';
import { PG_KEYWORDS } from './keywords/kwlist.js';

export const tokenize = (rawSQL: string) => {
    const tokens: Token[] = [];
    const chars = [...rawSQL];

    class $ {
        static get posn() {
            return rawSQL.length - chars.length;
        }
    }

    class Consume {
        static one(type: TokenType, char: string, expected: string) {
            if (char === expected) {
                tokens.push({
                    type,
                    value: char,
                    position: $.posn
                });
                return true;
            }

            return false;
        }

        static if(type: TokenType, char: string, comparator: RegExp): boolean;
        static if(_type: TokenType, char: string, comparator: RegExp) {
            if (comparator.test(char)) {
                const value = Consume.while(char, (char) =>
                    comparator.test(char)
                ).trim();

                const type = PG_KEYWORDS.has(value.toUpperCase())
                    ? TokenType.KEYWORD
                    : _type;

                tokens.push({
                    type,
                    value,
                    position: $.posn,
                    keyword: PG_KEYWORDS.get(value.toUpperCase())
                });

                return true;
            }

            return false;
        }

        static while(char: string, fn: (char: string) => boolean) {
            let value = char;

            let next: string | undefined = chars.shift();
            while (next && fn(next)) {
                value += next;
                next = chars.shift();
            }
            if (next) chars.unshift(next);
            return value;
        }
    }

    let char: string | undefined;
    while ((char = chars.shift())) {
        if (/\s|\t|\n/.test(char)) continue;

        if (char === '-') {
            const posn = $.posn;
            const nextChar = chars.shift();

            if (!nextChar) continue;

            if (nextChar === '-') {
                tokens.push({
                    position: posn,
                    type: TokenType.COMMENT,
                    value: Consume.while('--', (char) => char !== '\n')
                });
                continue;
            }

            chars.unshift(nextChar);
            chars.unshift(char);
        }

        if (Consume.if(TokenType.PUNCTUATION, char, punctuation)) continue;
        if (Consume.if(TokenType.STRING, char, word)) continue;
        if (Consume.if(TokenType.GROUP_OPEN, char, /\{|\(|\]/)) continue;
        if (Consume.if(TokenType.GROUP_CLOSE, char, /\}|\)|\[/)) continue;
        if (Consume.one(TokenType.REF_CHAR, char, '@')) continue;

        tokens.push({
            value: char,
            type: TokenType.OTHER,
            position: $.posn
        });
    }

    return tokens;
};
