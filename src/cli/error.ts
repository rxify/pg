import chalk from 'chalk';
import { highlight } from 'sql-highlight';
import { isTruthy } from '../lib/types.js';

export class PgsqlParserError extends Error {
    fileName!: string;
    functionName!: string;
    lineNumber!: number;
    cursorPosition!: number;
    context?: unknown;
}

export const isPgsqlParserError = (val: any): val is PgsqlParserError => {
    return (
        isTruthy(val) &&
        typeof val === 'object' &&
        'fileName' in val &&
        'cursorPosition' in val
    );
};

export class PgNativeError extends Error {
    length!: number;
    severity!: string;
    code!: string;
    details?: unknown;
    hint?: unknown;
    position?: string;
    internalPosition?: unknown;
    internalQuery?: unknown;
    where?: unknown;
    schema?: unknown;
    table?: unknown;
    column?: unknown;
    dataType?: unknown;
    constraint?: unknown;
    file!: string;
    line!: string;
    routine!: string;
}

export const isPgNativeError = (val: any): val is PgNativeError => {
    return (
        isTruthy(val) &&
        typeof val === 'object' &&
        'length' in val &&
        'severity' in val
    );
};

export const prettyPrintPgError = (
    error: any,
    text?: string,
    path?: string
) => {
    if (isPgNativeError(error) && text) {
        console.log(error);
        const syntaxErr = new PgSyntaxError(
            error.message,
            text,
            Number(error.position),
            path
        );
        console.error(syntaxErr.prettyPrint);
        if (error.hint) {
            console.error(error.hint);
        }

        return;
    }

    if (isPgsqlParserError(error) && text) {
        const syntaxErr = new PgSyntaxError(
            error.message,
            text,
            Number(error.cursorPosition),
            path
        );
        console.error(error.message);
        console.error(syntaxErr.prettyPrint);

        return;
    }

    console.error(error);
};

/**
 * Extension of SyntaxError that pretty prints error messages,
 * referencing the position in the input SQL directly.
 *
 * @todo move this into the main library
 */
export class PgSyntaxError extends SyntaxError {
    public prettyPrint?: string;

    constructor(
        message: string,
        public raw: string,
        public position: number,
        public path?: string
    ) {
        super(message);

        try {
            const { column, row, error } = this._printError(raw, position);

            message =
                `${chalk.blue(path ?? '')}:${chalk.yellow(row)}:${chalk.yellow(
                    column
                )} - ` +
                chalk.red('SyntaxError') +
                chalk.gray(': ') +
                chalk.white(message);

            this.prettyPrint = message + '\n\n' + error;
        } catch {
            this.prettyPrint = message;
        }
    }

    private _printError(raw: string, position: number) {
        const preError = raw.slice(0, position).split(/\n/g);
        const postError = raw.slice(position).split(/\n/g);

        const row = preError.length;

        const preErrorLn = preError.pop();
        const postErrorLn = postError.shift();

        if (!preErrorLn || !postErrorLn) throw new Error(this.message);

        const column = preErrorLn.length;

        const errorLn = preErrorLn + postErrorLn;

        const error = [
            highlight(preError.slice(preError.length - 4).join('\n')),
            highlight(errorLn),
            ' '.repeat(preErrorLn.length - 1) + chalk.bold.red('^'),
            highlight(postError.slice(0, 4).join('\n'))
        ].join('\n');

        return { column, row, error };
    }
}
