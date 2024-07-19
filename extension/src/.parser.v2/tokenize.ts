import { word } from './regexp.js';
import { Token, TokenType } from './types.js';

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

        static if(type: TokenType, char: string, comparator: RegExp) {
            if (comparator.test(char)) {
                const value = Consume.while(char, (char) =>
                    comparator.test(char)
                ).trim();
                tokens.push({
                    type,
                    value,
                    position: $.posn
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

        if (Consume.if(TokenType.WORD, char, word)) continue;
        if (Consume.if(TokenType.GROUP_OPEN, char, /\{/)) continue;
        if (Consume.if(TokenType.GROUP_CLOSE, char, /\}/)) continue;
        if (Consume.one(TokenType.REF_CHAR, char, '@')) continue;

        tokens.push({
            value: char,
            type: TokenType.OTHER,
            position: $.posn
        });
    }

    return tokens;
};
