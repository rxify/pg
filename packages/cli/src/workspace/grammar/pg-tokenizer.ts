import { PG_KEYWORD, PG_KEYWORDS } from './kwlist.js';
import { Tokenizer } from './tokenizer.js';

export enum TokenType {
    ALL,
    KEYWORD,
    WORD,
    NUMBER,
    COLUMN,
    STRING,
    REF,
    PUNCTUATION,
    OPEN,
    CLOSE,
    OTHER
}

export declare type Token = {
    position: number;
    type: TokenType;
    $type?: string;
    keyword?: PG_KEYWORD;
    value: string;
};

export class PgTokenizer extends Tokenizer<string, Token> {
    public override while(char: string): void {
        if (/\s|\n/.test(char)) return;

        if (/[a-z]|\.|_/i.test(char)) {
            const word = this.consume(char, 'UNSHIFT_ORPHAN')
                .while((char) => /[a-z]|\.|_/i.test(char))
                .join('');

            const token: Token = {
                value: word,
                position: this.position,
                type: TokenType.WORD
            };

            try {
                const keyword = PG_KEYWORDS.getIfExists(word);
                token.type = TokenType.KEYWORD;
                token.keyword = keyword;
            } catch {}

            if (word.includes('.')) {
                token.type = TokenType.REF;
            }

            this.tokens.push(token);
            return;
        }

        if (/"/.test(char)) {
            const quoted = this.consume('CONSUME_ORPHAN').until((char) =>
                /"/.test(char)
            );

            this.tokens.push({
                value: '"' + quoted.join(''),
                position: this.position,
                type: TokenType.COLUMN
            });

            return;
        }

        if (/'/.test(char)) {
            const quoted = this.consume('CONSUME_ORPHAN').until((char) =>
                /'/.test(char)
            );

            this.tokens.push({
                value: "'" + quoted.join(''),
                position: this.position,
                type: TokenType.STRING
            });

            return;
        }

        if (/\.|,|;/.test(char)) {
            this.tokens.push({
                value: char,
                position: this.position,
                type: TokenType.PUNCTUATION
            });

            return;
        }

        if (char === '*') {
            this.tokens.push({
                value: '*',
                position: this.position,
                type: TokenType.ALL
            });
            return;
        }

        if (/\(|\[/.test(char)) {
            this.tokens.push({
                value: char,
                position: this.position,
                type: TokenType.OPEN
            });
            return;
        }

        if (/\)|\]/.test(char)) {
            this.tokens.push({
                value: char,
                position: this.position,
                type: TokenType.CLOSE
            });
            return;
        }

        this.tokens.push({
            value: char,
            position: this.position,
            type: TokenType.OTHER,
            $type: TokenType[TokenType.OTHER]
        });
    }
}
