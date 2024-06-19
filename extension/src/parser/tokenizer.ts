import { PgSyntaxError } from './syntax-error';
import { ArrayTD } from './td-array';
import { reserved } from './reserved';

/**
 * Converts a token value or string value to lowercase.
 * @param token A token or string value
 * @returns The token value or string converted to lowercase
 */
export const _ = (token: Token | string) =>
    typeof token === 'string' ? token.toLowerCase() : token.value.toLowerCase();

/**
 * Converts a token value or string value to lowercase.
 * @param token A token or string value
 * @returns True if the lowercased values are equivalent.
 */
export const equal = (token: Token | string, value: string) =>
    _(token) === _(value);

export declare type TokenType =
    | 'keyword'
    | 'punctuation'
    | 'numeric'
    | 'cast'
    | 'arithmatic'
    | 'selector'
    | 'string'
    | 'assignment'
    | 'open'
    | 'close';

export declare type Token = {
    type: TokenType;
    value: string;
    position: number;
};

export class Tokenizer {
    public tokens = new ArrayTD<Token>();
    private _chars: ArrayTD<string>;

    constructor(
        public script: string,
        public source: string
    ) {
        this._chars = new ArrayTD(...script);
        this.tokenize();
    }

    tokenize() {
        while (this._chars.validPosn) {
            let char = this._chars.current;

            if (/\s|\t|\n/.test(char)) {
                this._chars.stepForward();
                continue;
            }

            // TODO why does this slow shit down so much?
            // if (char === '-') {
            //     char = this._chars.stepForward();

            //     if (char === '-') {
            //         this.consumeWhile((char) => char !== '\n');
            //         this._chars.stepForward();
            //     }

            //     continue;
            // }

            if (/[a-z]|[A-Z]|_/.test(char)) {
                const token = this.charsetToToken(
                    this.consumeWhile((char) => /[a-z]|[A-Z]|_/.test(char))
                );
                this.tokens.push(token);
                this._chars.stepForward();
                continue;
            }

            if (/:/.test(char)) {
                const $equals = this._chars.next;

                if (/=/.test($equals)) {
                    this.tokens.push({
                        type: 'assignment',
                        value: ':=',
                        position: this._chars.posn
                    });
                    this._chars.stepForward();
                    continue;
                }

                throw this.error('=');
            }

            if (/\(/.test(char)) {
                this.tokens.push({
                    type: 'open',
                    value: char,
                    position: this._chars.posn
                });
                this._chars.stepForward();
                continue;
            }

            if (/\)/.test(char)) {
                this.tokens.push({
                    type: 'close',
                    value: char,
                    position: this._chars.posn
                });
                this._chars.stepForward();
                continue;
            }

            if (/\.|,|;|=|"|'/.test(char) || char === '*') {
                this.tokens.push({
                    type: 'punctuation',
                    value: char,
                    position: this._chars.posn
                });
                this._chars.stepForward();
                continue;
            }

            if (/[0-9]/.test(char)) {
                const number = this.consumeWhile((char) => /[0-9]/.test(char));
                this.tokens.push({
                    type: 'numeric',
                    value: number,
                    position: this._chars.posn - `${number}`.length
                });
                this._chars.stepForward();
                continue;
            }

            if (/-|\+/.test(char)) {
                this.tokens.push({
                    type: 'arithmatic',
                    value: char,
                    position: this._chars.posn
                });
                this._chars.stepForward();
                continue;
            }

            this._chars.stepForward();
        }

        return this;
    }

    private consumeWhile(predicate: (char: string) => boolean): string {
        let result = '';
        let nextChar = this._chars.current;
        while (predicate(nextChar)) {
            result += nextChar;
            nextChar = this._chars.next;
        }
        this._chars.stepBack();
        return result;
    }

    /**
     * Evaluates a string of tokens.
     * @param charset A string of chars
     * @returns If `charset` is matched against a sql keyword,
     * returns a token of type `keyword`; otherwise, crates
     * a token of type string;
     */
    private charsetToToken(charset: string): Token {
        // If the charset represents a reserved SQL token
        if (reserved[charset.charAt(0)]?.test(charset)) {
            return {
                type: 'keyword',
                value: charset,
                position: this._chars.posn - charset.length - 1
            };
        }

        // Otherwise, it's a string
        return {
            type: 'string',
            value: charset,
            position: this._chars.posn - charset.length
        };
    }

    /**
     * Evaluates the _next_ token and steps forward if `step` is defined.
     * @param type A token type
     * @param step Specifies whether the next token should be unshifted
     * @returns The evaluated token
     * @throws Will throw a {@link PgSyntaxError} if the token
     * is not of the expected `type`.
     */
    public expect(type: TokenType, step: 'NXT'): Token;

    /**
     * Evaluates the _next_ token and steps forward if `step` is defined.
     * @param type An expected token type
     * @param value An expected token value
     * @param step Specifies whether the next token should be unshifted
     * @returns The evaluated token
     * @throws Will throw a {@link PgSyntaxError} if the token
     * is not of the expected `type` or (if `value` is provided)
     * if the token value does not match `value`.
     */
    public expect(type: TokenType, value?: string, step?: 'NXT'): Token;

    public expect(
        type: TokenType,
        valueOrStep?: string,
        stepOrUndefined?: 'NXT'
    ) {
        const next = this.tokens.next;

        let value: string | undefined;
        let step: 'NXT' | undefined;

        if (typeof valueOrStep === 'string') {
            if (valueOrStep === 'NXT') {
                step = valueOrStep;
            } else {
                value = valueOrStep;
                step = stepOrUndefined;
            }
        }

        if (value !== undefined && !equal(next, value)) {
            throw this.error(value);
        }

        if (next.type !== type) {
            throw this.error(type);
        }

        if (step === 'NXT') {
            return this.tokens.next;
        }

        return next;
    }

    /**
     * Evaluates the _next_ token and steps forward if `step` is defined.
     * @param type A token type
     * @param step Specifies whether the next token should be unshifted
     * @returns The evaluated token
     * @throws Will throw a {@link PgSyntaxError} if the token
     * is not of the expected `type`.
     */
    public test(type: TokenType, throwErr?: 'THROW' | 'NO_THROW'): boolean;

    /**
     * Evaluates the _next_ token and steps forward if `step` is defined.
     * @param type An expected token type
     * @param value An expected token value
     * @param step Specifies whether the next token should be unshifted
     * @returns The evaluated token
     * @throws Will throw a {@link PgSyntaxError} if the token
     * is not of the expected `type` or (if `value` is provided)
     * if the token value does not match `value`.
     */
    public test(
        type: TokenType,
        value?: string,
        throwErr?: 'THROW' | 'NO_THROW'
    ): boolean;

    public test(
        type: TokenType,
        valueOrThrow?: string,
        throwErrOrUndefined?: 'THROW' | 'NO_THROW'
    ): boolean {
        const current = this.tokens.current;

        let value: string | undefined;
        let throwErr: 'THROW' | 'NO_THROW' | undefined;

        if (typeof valueOrThrow === 'string') {
            if (valueOrThrow === 'THROW' || valueOrThrow === 'NO_THROW') {
                throwErr = valueOrThrow;
            } else {
                value = valueOrThrow;
                throwErr = throwErrOrUndefined;
            }
        }

        if (value !== undefined && !equal(current, value)) {
            if (throwErr === 'THROW') {
                throw this.error(type, current);
            }

            return false;
        }

        if (current.type !== type) {
            if (throwErr === 'THROW') {
                throw this.error(type, current);
            }

            return false;
        }

        return true;
    }

    /**
     * Grabs the _next_ token off the stack and evaluates whether
     * it is a string or a number.
     * @returns The value of the next node if it is a string or a number
     * @throws Will throw an error if the _next_ token is not a string
     * or a number.
     */
    public expectStringOrNumber() {
        this.tokens.stepForward();

        if (
            !this.test('string', 'NO_THROW') &&
            !this.test('numeric', 'NO_THROW')
        ) {
            throw this.error(['string', 'number']);
        }

        if (this.test('string', 'NO_THROW')) {
            return this.tokens.current.value;
        }

        return this.expectParseableNumber(this.tokens.current);
    }

    public expectParseableNumber(token?: Token) {
        // If a token is not provided, we get the next one from the top of the stack
        if (!token) {
            let t = this.tokens.next;

            if (t.type !== 'numeric') {
                throw this.error('number', t);
            }

            token = t;
        }

        // If this token is not numeric, so we have to error
        if (token.type !== 'numeric') {
            throw this.error('number', token);
        }

        let length = Number(token.value);

        // We couldn't parse this 'number', so we have to error
        if (isNaN(length)) {
            throw this.error('Parseable number', token);
        }

        return length;
    }

    /**
     * Constructs a {@link PgSyntaxError}.
     * @param expected The expected token(s) string value(s)
     * @param token An optional token. Defaults to the current token.
     * @param key An optional keyof `Token`. Defaults to `value`
     * @returns An initialized {@link PgSyntaxError}
     */
    public error(expected: any | any[], token?: Token) {
        token ??= this.tokens.current;

        if (typeof expected === 'string') {
            if (expected === 'close') {
                expected = ')';
            } else if (expected === 'open') {
                expected = '(';
            }
        }

        return new PgSyntaxError(
            token.position,
            this.script,
            this.source,
            expected,
            token['value']
        );
    }
}
