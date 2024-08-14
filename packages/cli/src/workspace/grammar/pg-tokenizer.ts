import { PG_KEYWORD, PG_KEYWORDS } from './kwlist.js';
import { Tokenizer } from './tokenizer.js';

export enum TokenType {
    KEYWORD,
    WORD,
    NUMBER,
    COLUMN,
    STRING,
    REF
}

export declare type Token = {
    position: number;
    type: TokenType;
    $type: string;
    keyword?: PG_KEYWORD;
    value: string;
};

export class PgTokenizer extends Tokenizer<string, Token> {
    public override next(char: string): void {
        if (/[a-z]|\.|_/i.test(char)) {
            const word = this.consume('DISCARD_ORPHAN')
                .while((char) => /[a-z]|\.|_/i.test(char))
                .join('');

            const token: Token = {
                value: word,
                position: this.position,
                type: TokenType.WORD,
                $type: TokenType[TokenType.WORD]
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
            const quoted = this.consume(
                'CONSUME_ORPHAN',
                this.elms.shift()
            ).until((char) => /"/.test(char));

            this.tokens.push({
                position: this.position,
                type: TokenType.COLUMN,
                $type: TokenType[TokenType.COLUMN],
                value: '"' + quoted.join('')
            });

            return;
        }

        if (/'/.test(char)) {
            const quoted = this.consume(
                'CONSUME_ORPHAN',
                this.elms.shift()
            ).until((char) => /'/.test(char));

            this.tokens.push({
                position: this.position,
                type: TokenType.STRING,
                $type: TokenType[TokenType.STRING],
                value: "'" + quoted.join('')
            });

            return;
        }
    }
}
