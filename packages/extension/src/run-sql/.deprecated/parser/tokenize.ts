import { PgSyntaxError } from './syntax-error';
import { reserved } from './reserved';

export declare type TokenType =
    | '$'
    | 'all'
    | 'assignment'
    | 'close'
    | 'comment'
    | 'describe'
    | 'function'
    | 'import'
    | 'math'
    | 'null'
    | 'number'
    | 'open'
    | 'punctuation'
    | 'reserved'
    | 'returns'
    | 'string'
    | 'table'
    | 'unknown';

export declare type Token = {
    position: number;
    lineNum: number;
    value: string;
    type: TokenType;
};

export function tokenize(raw: string, source: string) {
    const tokens: Token[] = [];
    const chars = raw.split(/|/g);

    let cursor = -1;
    let position = 0;
    let char = '';

    const stepForward = () => {
        cursor = cursor + 1;
        char = chars[cursor];
        return char;
    };

    const stepBack = () => {
        if (cursor - 1 >= 0) cursor = cursor - 1;
        char = chars[cursor];
        return char;
    };

    /**
     * Consumes tokens until `consumeUntil` returns `false`.
     * @param char
     * @param consume The end condition for token consumption
     * @returns A concatenated string of all tokens consumed
     */
    const consume = (consume: (char: string) => boolean) => {
        let concat = char ?? '';

        while (consume(stepForward())) {
            concat = concat + char;
        }

        stepBack();

        return concat;
    };

    const addToken = (value: string, type: TokenType) => {
        tokens.push({
            position,
            lineNum: raw.slice(0, position).split(/\n/g).length - 1,
            type,
            value
        });
    };

    const error = (message: string) =>
        new PgSyntaxError(cursor, raw, source, message);

    while (stepForward()) {
        position = cursor;

        // Ignore newlines, spaces, and tabs
        if (/\s|\t|\r|\n/.test(char)) {
            continue;
        }

        if (char === '*') {
            addToken('*', 'all');
            continue;
        }

        if (char === '(') {
            addToken('(', 'open');
            continue;
        }

        if (char === ')') {
            addToken(')', 'close');
            continue;
        }

        // Check for punctuation
        if (/\.|,|;|=|"|'/.test(char)) {
            addToken(char, 'punctuation');
            continue;
        }

        // Check for numbers
        if (/[0-9]/.test(char)) {
            const number = consume((char) => /[0-9]/.test(char));
            addToken(number, 'number');
            continue;
        }

        // Check for dynamic refs and function delimiter
        if (/\$/.test(char)) {
            const val = consume((char) => char === '$');
            addToken(val, '$');
            continue;
        }

        // Check for full "words," including function calls
        // formatted at "schema.function"
        if (/[a-z]|[A-Z]|_|\./.test(char)) {
            const consumed = consume((token) => /[a-z]|[A-Z]|_|\./.test(token));

            // Check if `val` is a reserved keyword
            if (reserved[consumed.charAt(0)]?.test(consumed)) {
                addToken(consumed, 'reserved');
                continue;
            }

            if (/^NULL$/.test(consumed)) {
                addToken(consumed, 'null');
                continue;
            }

            if (consumed.includes('.')) {
                // We're calling a function if `val` is followed by "("
                if (/\s{0,}|\(/.test(chars[cursor + 1])) {
                    addToken(consumed, 'function');
                    continue;
                }

                // Otherwise, `val` is a table reference
                addToken(consumed, 'table');
                continue;
            }

            addToken(consumed, 'string');
            continue;
        }

        // Check for value assignments
        if (/:/.test(char)) {
            stepForward();

            if (/=/.test(char)) {
                addToken(':=', 'assignment');
                continue;
            }

            throw error(`Expected '=', received ${char}`);
        }

        // Check for comments
        if (char === '-') {
            stepForward();

            if (/-/.test(char)) {
                stepBack();

                const consumed = consume((token) => !/\n/.test(token));

                if (consumed.includes('@returns')) {
                    addToken(consumed, 'returns');
                    continue;
                }

                if (consumed.includes('@describe')) {
                    addToken(consumed, 'describe');
                    continue;
                }

                if (consumed.includes('@import')) {
                    addToken(consumed, 'import');
                    continue;
                }

                addToken(consumed, 'comment');
                continue;
            }

            stepBack();
            addToken('-', 'math');

            continue;
        }

        // Check for math
        if (/-|\+/.test(char)) {
            addToken(char, 'math');
            continue;
        }

        // Add token as unknown
        addToken(char, 'unknown');
    }

    return tokens;
}
