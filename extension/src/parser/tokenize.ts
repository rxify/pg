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
        /**
         * Evaluates if `char === expected`. If `true`, pushes a new token
         * with type `type` into `tokens`.
         * @param type An expected token type
         * @param char A character to evaluate
         * @param expected An expected character value
         * @returns `true` if `char === expected`; otherwise, `false`
         */
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

        /**
         * Matches `char` against `comparator`. If `true`, consumes tokens from
         * `tokens` and pushes them into `tokens` while the shifted tokens are
         * matched with `comparator`.
         * @param type An expected token type
         * @param char A character to evaluate
         * @param comparator A regular expression used to evaluate `char`
         * @returns `true` if `comparator.test` evaluates to true; otherwise, `false`
         */
        static if(type: TokenType, char: string, comparator: RegExp) {
            if (comparator.test(char)) {
                const value = this.while(char, (char) =>
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

        /**
         * Concats `chars` shifted from `tokens` to `char` until
         * `fn` evaluates false, returning the concatenated string.
         * @param char A character
         * @param fn A function that evaluates characters shifted off `tokens`
         */
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

    /** The char being currently evaluated. */
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
