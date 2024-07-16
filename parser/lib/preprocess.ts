import { PgSyntaxError } from './error.js';
import { format } from './format.js';
import { tokenize } from './tokenize.js';
import { Token, TokenType } from './types.js';

export const preprocessSQL = (rawSQL: string, path: string) => {
    const tokens = tokenize(rawSQL);

    let token: Token | undefined;

    class Err {
        static match(
            expected: string,
            received: string,
            position: number | Token
        ) {
            return Err.msg(
                `Expected ${expected}, received ${received}`,
                position
            );
        }

        static null(expected: string, position: number | Token) {
            return Err.msg(
                `Expected ${expected}, received undefined.`,
                position
            );
        }

        static msg(message: string, position: number | Token) {
            if (typeof position !== 'number') {
                position = position.position + position.value.length;
            }

            return new PgSyntaxError(message, path, rawSQL, position);
        }
    }

    class Definition {
        static definitions: {
            [defName: string]: {
                startPosn: number;
                endPosn: number;
                value: string;
            };
        } = {};

        static consume(at: Token) {
            const defType = this._type(at);
            const defName = this._name(defType);
            this._open(defName);
            this.definitions[defName.value] = this._body(at.position - 1);
        }

        static _type(token: Token) {
            const defType = tokens.shift();

            if (!defType) {
                throw Err.msg('a tag type.', token);
            }

            return defType;
        }

        static _name(defType: Token) {
            const defName = tokens.shift();

            if (!defName) {
                throw Err.null('tag name', defType);
            }

            return defName;
        }

        private static _open(defName: Token) {
            const open = tokens.shift();

            if (!open) {
                throw Err.null(`'{'`, defName);
            }

            if (open.value !== '{') {
                throw Err.msg(
                    `Expected '{', received ${open.value}.`,
                    open.position
                );
            }
        }

        private static _body(startPosn: number) {
            let bodyTokens = [];

            let next: Token | undefined;
            while ((next = tokens.shift())) {
                if (next.value === '{{') {
                    Reference.consume(next);
                    continue;
                }

                if (next.value === '}') {
                    const first = bodyTokens.shift();
                    const last = bodyTokens.pop();

                    if (!first || !last) {
                        throw new Error();
                    }

                    const body = rawSQL.substring(
                        first.position - first.value.length,
                        last.position
                    );

                    return {
                        startPosn,
                        endPosn: last.position + 2,
                        value: body
                    };
                }

                bodyTokens.push(next);
            }

            throw Err.msg('Definition not terminated.', token?.position ?? 0);
        }
    }

    class Reference {
        static replacers: {
            startPosn: number;
            endPosn: number;
            text: string;
            raw: string;
        }[] = [];

        static consume(open: Token) {
            const name = this._name(open);
            const close = this._close(name);
            const definition = Definition.definitions[name.value];

            if (!definition) {
                throw Err.msg(`Could not find '${name.value}'.`, name);
            }

            this.replacers.push({
                startPosn: open.position,
                text: definition.value,
                endPosn: close.position + 2,
                raw: rawSQL.substring(open.position - 2, close.position)
            });
        }

        private static _name(open: Token) {
            const name = tokens.shift();

            if (!name) {
                throw Err.null('reference', open);
            }

            if (name.type !== TokenType.WORD) {
                throw Err.match(
                    `a 'string'`,
                    TokenType[name.type],
                    name.position
                );
            }
            return name;
        }

        private static _close(name: Token) {
            const close = tokens.shift();

            if (!close) {
                throw Err.null(`'}}'`, name);
            }

            if (close.value !== '}}') {
                throw Err.match(`'}}'`, close.value, close.position);
            }

            return close;
        }
    }

    while ((token = tokens.shift())) {
        if (token.type === TokenType.REF_CHAR) {
            Definition.consume(token);
        }

        if (token.value === '{{') {
            Reference.consume(token);
        }
    }

    let output = rawSQL;
    let offset = 0;

    Object.values(Definition.definitions).forEach((definition) => {
        const pre = definition.startPosn - offset;
        const post = definition.endPosn - offset;

        output = output.substring(0, pre) + output.substring(post);

        const len = definition.endPosn - definition.startPosn;
        offset = offset + len;
    });

    Reference.replacers.forEach((replacer) => {
        output = output.replace(new RegExp(replacer.raw, 'g'), replacer.text);
    });

    return {
        sql: output.trim(),
        formatted: format(output.trim()),
        definitions: Definition.definitions
    };
};
