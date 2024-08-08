import { chalk } from '../utility/chalk';
import { highlight } from 'sql-highlight';

import { isToken, TokenType } from './types';

export class PgSyntaxError extends SyntaxError {
    /** A raw SQL script */
    public script: string;

    /** The position of an error */
    public position?: number;

    /** The path to a local SQL script */
    public path?: string;

    constructor(options: { script: string; position?: number; path?: string });

    constructor(options: {
        expected?: string | TokenType;
        received?: string | TokenType;
        script: string;
        position?: number;
        path?: string;
    });

    constructor(options: {
        message: string;
        script: string;
        position?: number;
        path?: string;
    });

    constructor({
        script,
        position,
        path,
        message,
        expected,
        received
    }: {
        script: string;
        position?: number;
        path?: string;
        message?: string;
        expected?: string | TokenType;
        received?: string | TokenType;
    }) {
        super(
            formatSqlMessage({
                message,
                expected,
                received
            })
        );

        this.script = script;
        this.position = position;
        this.path = path;
    }

    public get prettyPrint() {
        try {
            const { column, row, error } = this._printError(
                this.script,
                this.position ?? 0
            );

            const p = /**/ `${this.path ? chalk.blue(this.path) : ''}:`;
            const message =
                `${p}${chalk.yellow(row)}:${chalk.yellow(column)} - ` +
                chalk.red('SyntaxError') +
                chalk.gray(': ') +
                chalk.white(this.message);

            return message + '\n\n' + error;
        } catch (e) {
            return this.message;
        }
    }

    private _printError(raw: string, position: number) {
        const preError = raw.slice(0, position).split(/\n/g);
        const postError = raw.slice(position).split(/\n/g);

        const row = preError.length;

        const preErrorLn = preError.pop() ?? '';
        const postErrorLn = postError.shift() ?? '';

        const column = preErrorLn.length;
        const errorLn = preErrorLn + postErrorLn;

        const error = [
            highlight(preError.slice(preError.length - 4).join('\n')),
            highlight(errorLn),
            ' '.repeat(preErrorLn.length) + chalk.red('^'),
            highlight(postError.slice(0, 4).join('\n'))
        ].join('\n');

        return { column, row, error };
    }

    public fork(options: {
        expected: string | TokenType;
        received?: string | TokenType;
        position?: number;
    }): PgSyntaxError;

    public fork(options: { message: string; position?: number }): PgSyntaxError;

    public fork({
        position,
        message,
        expected,
        received
    }: {
        position?: number;
        message?: string;
        expected?: string | TokenType;
        received?: string | TokenType;
    }): PgSyntaxError {
        if (message) {
            return new PgSyntaxError({
                message,
                position,
                script: this.script,
                path: this.path
            });
        }

        return new PgSyntaxError({
            expected,
            received,
            position,
            script: this.script,
            path: this.path
        });
    }
}

function formatSqlMessage({
    message,
    expected,
    received
}: {
    message?: string;
    expected?: string | TokenType;
    received?: string | TokenType;
}) {
    if (message) return message;

    return (
        'Expected `' +
        getStrVal(expected) +
        '`, received `' +
        getStrVal(received) +
        '`'
    );
}

function getStrVal(token?: string | TokenType) {
    if (!token) return 'unknown';
    if (typeof token === 'string') return token;
    if (isToken(token)) return TokenType[token.type];
    return TokenType[token];
}
