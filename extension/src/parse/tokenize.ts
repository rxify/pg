import { PG_KEYWORDS } from './kwlist';
import { Token, TokenType } from './types';

export const tokenize = (script: string) => {
    const tokens: Token[] = [];

    const wspc = /\t|\n|\s|\r/;
    const word = /[A-Z]|[a-z]|_|\./;
    const punc = /\!|;|\,/;
    const math = /\+|-|\/|=/;
    const open = /\(|\{|\[/;
    const close = /\)|\}|\]/;

    const posn = () => script.length - chars.length;

    const consume = (char = chars.shift()) => ({
        while: (_while: (char: string) => boolean) => {
            let word: string = '';
            while (char && _while(char)) {
                word += char;
                char = chars.shift();
            }
            if (char) chars.unshift(char);
            return word;
        },
        until: (until: (char: string) => boolean) => {
            let word: string = '';
            while (char && !until(char)) {
                word += char;
                char = chars.shift();
            }
            if (char) chars.unshift(char);
            return word;
        }
    });

    const pushToken = (type: TokenType, value: string) => {
        tokens.push({
            type,
            value,
            position: posn()
        });
    };

    const chars = [...script];
    let char: string | undefined;

    while ((char = chars.shift())) {
        if (wspc.test(char)) continue;

        if (word.test(char)) {
            let value = consume(char).while((char) => word.test(char));
            const _value = value.toUpperCase();

            if (PG_KEYWORDS.has(_value)) {
                pushToken(TokenType.KEYWORD, value);
                continue;
            }

            pushToken(TokenType.WORD, value);
            continue;
        }

        if (punc.test(char)) {
            pushToken(TokenType.PUNCT, char);
            continue;
        }

        if (open.test(char)) {
            pushToken(TokenType.GROUP_OPEN, char);
            continue;
        }

        if (close.test(char)) {
            pushToken(TokenType.GROUP_CLOSE, char);
            continue;
        }

        if (char === '-') {
            const next = chars.shift();
            if (!next) continue;
            if (next !== '-') {
                pushToken(TokenType.OPERATOR, char);
                chars.unshift(next);
                continue;
            }
            const comment = consume('--').until((char) => char !== '\n');
            pushToken(TokenType.COMMENT, comment);
            continue;
        }

        if (math.test(char)) {
            pushToken(TokenType.OPERATOR, char);
            continue;
        }

        if (char === ':') {
            const next = chars.shift();
            if (!next) continue;
            if (next !== '=') {
                pushToken(TokenType.PUNCT, char);
                chars.unshift(next);
                continue;
            }
            pushToken(TokenType.OPERATOR, ':=');
            continue;
        }

        if (char === "'") {
            const str = consume().until((char) => char === "'");
            const next = chars.shift();
            if (!next || next !== "'")
                throw new SyntaxError(`Expected "'", recieved ${char}`);
            pushToken(TokenType.STRING, "'" + str + "'");
            continue;
        }

        if (char === '"') {
            const str = consume().until((char) => char === '"');
            const next = chars.shift();
            if (!next || next !== '"')
                throw new SyntaxError(`Expected '"', recieved ${char}`);
            pushToken(TokenType.COL_NAME, '"' + str + '"');
            continue;
        }

        pushToken(TokenType.UNKNOWN, char);
    }

    return tokens;
};
