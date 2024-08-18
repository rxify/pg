```ts
import { PgTokenizer, Token, TokenType } from '../grammar/pg-tokenizer.js';
import { Tokenizer } from '../grammar/tokenizer.js';
// import { find, slice } from '../slice.js';

export declare interface SelectCol {
    reference: {
        table?: string;
        column: string;
    }[];
    alias?: string;
}

export declare interface Select extends ParsedStmt {
    columns: SelectCol[] | '*';
}

export class FromTokenizer extends Tokenizer<Token, Token> {
    public override next(token: Token): void {
        if (/\bonly\b/i.test(token.value)) {
            /\b(tablesample|repeatable|lateral)\b/i;
        }
    }
}

export class SelectTokenizer extends Tokenizer<Token, Token> {
    public columns?: Token[][];
    public join?: Token[];
    public aliases: {
        position: number;
        reference: string;
        alias: string;
    }[] = [];

    public from: Token[] = [];
    public having: Token[] = [];
    public window: Token[] = [];
    public order: Token[] = [];
    public limit: Token[] = [];
    public group: Token[] = [];
    public offset: Token[] = [];
    public fetch: Token[] = [];
    public for: Token[] = [];
    public where: Token[] = [];

    public override next(token: Token): void {
        if (/\bselect\b/i.test(token.value)) {
            this.columns ??= [];

            const columns = this._consumeRegex(/\bfrom\b/i);

            let tokens: Token[] = [];
            let token: Token | undefined;

            while ((token = columns.shift())) {
                if (/,/.test(token.value)) {
                    this.columns.push([...tokens]);
                    tokens.length = 0;
                    continue;
                }
                tokens.push(token);
            }
            this.columns.push(tokens);

            return;
        }

        if (/\bfrom\b/i.test(token.value)) {
            this.from = this._consumeRegex(
                /\b(where|group|having|window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
            );
            return;
        }

        if (/\bwhere\b/i.test(token.value)) {
            this.where = this._consumeRegex(
                /\b(group|having|window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
            );
            return;
        }

        if (/\bgroup\b/i.test(token.value)) {
            this.group = this._consumeRegex(
                /\b(having|window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
            );
            return;
        }

        if (/\bhaving\b/i.test(token.value)) {
            this.having = this._consumeRegex(
                /\b(window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
            );
            return;
        }

        if (/\bwindow\b/i.test(token.value)) {
            this.window = this._consumeRegex(
                /\b(union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
            );
            return;
        }

        if (/\border\b/i.test(token.value)) {
            this.order = this._consumeRegex(
                /\b(limit|offset|fetch|for|join|;)\b/i
            );
            return;
        }

        if (/\blimit\b/i.test(token.value)) {
            this.limit = this._consumeRegex(/\b(offset|fetch|for|join|;)\b/i);
            return;
        }

        if (/\boffset\b/i.test(token.value)) {
            this.offset = this._consumeRegex(/\b(fetch|for|join|;)\b/i);
            return;
        }

        if (/\bfetch\b/i.test(token.value)) {
            this.fetch = this._consumeRegex(/\b(for|join|;)\b/i);
            return;
        }

        if (/\bfor\b/.test(token.value)) {
            this.for = this._consumeRegex(/;/);
            return;
        }
    }

    private _consumeRegex(regexp: RegExp) {
        const consumed = this.consume('UNSHIFT_ORPHAN').until((token) =>
            regexp.test(token.value)
        );
        const last = consumed.pop();
        if (last) {
            if (last.type === TokenType.KEYWORD) this.tokens.unshift(last);
            else consumed.push(last);
        }
        return consumed;
    }
}
```

```ts
import { ParsedStmt } from '../document.js';
import { PgTokenizer, Token, TokenType } from '../grammar/pg-tokenizer.js';
import { Tokenizer } from '../grammar/tokenizer.js';
// import { find, slice } from '../slice.js';

export declare interface SelectCol {
    reference: {
        table?: string;
        column: string;
    }[];
    alias?: string;
}

export declare interface Select extends ParsedStmt {
    columns: SelectCol[] | '*';
}

export declare interface Alias {
    tokens?: Token[];
    reference?: string;
    alias: string;
}

export class FromTokenizer extends Tokenizer<Token, Token> {
    public override next(token: Token): void {
        if (/\bonly\b/i.test(token.value)) {
            /\b(tablesample|repeatable|lateral)\b/i;
        }
    }
}

export class SelectTokenizer {
    private _token: Token | undefined;
    private _lastToken: Token | undefined;

    public columns?: Token[][];
    public join?: Token[];
    // public aliases: {
    //     position: number;
    //     reference: string;
    //     alias: string;
    // }[] = [];

    public from: Token[] = [];
    public having: Token[] = [];
    public window: Token[] = [];
    public order: Token[] = [];
    public limit: Token[] = [];
    public group: Token[] = [];
    public offset: Token[] = [];
    public fetch: Token[] = [];
    public for: Token[] = [];

    constructor(public tokens: Token[]) {}

    public aliases: Alias[] = [];

    public parseSelect() {
        while ((this._token = this.tokens.shift())) {
            if (/select/i.test(this._token.value)) {
                const selectStmt = this.gatherSelect(this._token);
                const processed = this.processSelectTokens(selectStmt);
                console.log(JSON.stringify(processed.aliases, null, 4));
            }
        }
    }

    public gatherSelect(token: Token) {
        const tokens: Token[] = [];

        while (this.tokens.length > 0) {
            const next = this.next();
            if (/from/i.test(next.value)) {
                this.tokens.unshift(next);
                return tokens;
            }
            tokens.push(next);
        }

        return tokens;
    }

    public processSelectTokens(tokens: Token[]) {
        let token: Token | undefined;

        while ((token = tokens.pop())) {
            if (/\bas\b/i.test(token.value)) {
                let alias = this._lastToken;
                if (!alias) throw 'An alias must follow AS keyword.';
                let eos = this.next();

                if (eos.type === TokenType.REF) {
                    this.aliases.unshift({
                        alias: alias.value,
                        reference: eos.value,
                        tokens: [eos, alias]
                    });
                    continue;
                }

                if (eos.value === ')') {
                    let cont = true;
                    const tokens: Token[] = [eos, alias];

                    while (cont) {
                        const next = tokens.pop();
                        if (!next) throw 'Unexpected EOI';
                        if (next.value === '(') {
                            cont = false;
                        }
                        tokens.unshift(next);
                    }

                    this.aliases.unshift({
                        alias: alias.value,
                        tokens
                    });
                }
                continue;
            }

            this._lastToken = this._token;
        }

        return this;
    }

    public next(count = 1): Token {
        while (true) {
            count -= 1;
            const next = this.tokens.shift();
            if (!next) throw 'Unexpected end of input.';
            if (count === 0) return next;
        }
    }

    public last(count = 1): Token {
        while (true) {
            count -= 1;
            const next = this.tokens.pop();
            if (!next) throw 'Unexpected end of input.';
            if (count === 0) return next;
        }

        //     if (/\bselect\b/i.test(token.value)) {
        //         this.columns ??= [];
        //         const columns = this._consumeRegex(/\bfrom\b/i);
        //         let tokens: Token[] = [];
        //         let token: Token | undefined;
        //         while ((token = columns.shift())) {
        //             if (/,/.test(token.value)) {
        //                 this.columns.push([...tokens]);
        //                 tokens.length = 0;
        //                 continue;
        //             }
        //             tokens.push(token);
        //         }
        //         this.columns.push(tokens);
        //         return;
        //     }
        //     if (/\bfrom\b/i.test(token.value)) {
        //         this.from = this._consumeRegex(
        //             /\b(where|group|having|window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
        //         );
        //         return;
        //     }
        //     if (/\bwhere\b/i.test(token.value)) {
        //         this.group = this._consumeRegex(
        //             /\b(group|having|window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
        //         );
        //         return;
        //     }
        //     if (/\bgroup\b/i.test(token.value)) {
        //         this.group = this._consumeRegex(
        //             /\b(having|window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
        //         );
        //         return;
        //     }
        //     if (/\bhaving\b/i.test(token.value)) {
        //         this.having = this._consumeRegex(
        //             /\b(window|union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
        //         );
        //         return;
        //     }
        //     if (/\bwindow\b/i.test(token.value)) {
        //         this.window = this._consumeRegex(
        //             /\b(union|intersect|except|order|limit|offset|fetch|for|join|;)\b/i
        //         );
        //         return;
        //     }
        //     if (/\border\b/i.test(token.value)) {
        //         this.order = this._consumeRegex(
        //             /\b(limit|offset|fetch|for|join|;)\b/i
        //         );
        //         return;
        //     }
        //     if (/\blimit\b/i.test(token.value)) {
        //         this.limit = this._consumeRegex(/\b(offset|fetch|for|join|;)\b/i);
        //         return;
        //     }
        //     if (/\boffset\b/i.test(token.value)) {
        //         this.offset = this._consumeRegex(/\b(fetch|for|join|;)\b/i);
        //         return;
        //     }
        //     if (/\bfetch\b/i.test(token.value)) {
        //         this.fetch = this._consumeRegex(/\b(for|join|;)\b/i);
        //         return;
        //     }
        //     if (/\bfor\b/.test(token.value)) {
        //         this.for = this._consumeRegex(/;/);
        //         return;
        //     }
    }

    // private _consumeRegex(regexp: RegExp) {
    //     const consumed = this.consume('UNSHIFT_ORPHAN').until((token) =>
    //         regexp.test(token.value)
    //     );
    //     const last = consumed.pop();
    //     if (last) {
    //         if (last.type === TokenType.KEYWORD) this.tokens.unshift(last);
    //         else consumed.push(last);
    //     }
    //     return consumed;
    // }
}

// @ts-ignore
export function parseSelect(sql: string, doc: string): Select {
    const tokens = new PgTokenizer([...sql]).tokenize().tokens;
    const sections = new SelectTokenizer(tokens).parseSelect();
    // console.log(sections.aliases);
    return {
        columns: [],
        name: 'hello'
    };
}
```
