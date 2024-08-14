import chalk from 'chalk';
import { highlight } from 'sql-highlight';
import { isNativeError } from 'util/types';

/** Safely assert that `val` is a `PgSyntaxError` */
export function isPgSyntaxError(val: any): val is PgSyntaxError {
    return (
        val !== null &&
        val !== undefined &&
        isNativeError(val) &&
        'raw' in val &&
        'position' in val
    );
}

/**
 * Extension of SyntaxError that pretty prints error messages,
 * referencing the position in the input SQL directly.
 *
 * @todo move this into the main library
 */
export class PgSyntaxError extends SyntaxError {
    constructor(
        message: string,
        public raw: string,
        public position: number,
        public path?: string
    ) {
        super(message);
    }

    public prettyPrint() {
        const formatted = this._formatError(
            this.message,
            this.raw,
            this.position,
            this.path
        );
        return formatted.message + '\n\n' + formatted.prettyPrinted;
    }

    private _formatError(
        message: string,
        raw: string,
        position: number,
        path?: string
    ) {
        try {
            const { column, row, prettyPrinted } = this._highlightErr(
                raw,
                position
            );

            return {
                message:
                    `${chalk.blue(path ?? '')}:${chalk.yellow(
                        row
                    )}:${chalk.yellow(column)} - ` +
                    chalk.red('SyntaxError') +
                    chalk.gray(': ') +
                    chalk.white(message),
                prettyPrinted
            };
        } catch {
            return { message };
        }
    }

    private _highlightErr(raw: string, position: number) {
        // Slice the raw SQL into two sections--the section before the error
        // and after the error
        let preError = raw.slice(0, position);
        let postError = raw.slice(position);

        // For an error that occurs in the middle of a line, get the
        // section of the line that comes before the error and the section
        // of the line that comes after the section
        const preErrorLn = preError.slice(preError.lastIndexOf('\n') + 1);
        const postErrorLn = postError.slice(0, postError.indexOf('\n'));

        // Remove the error line from the section before and after the error
        preError = preError.replace(preErrorLn, '');
        postError = postError.replace(postErrorLn, '');

        if (preError.endsWith('\n'))
            preError = preError.substring(0, preError.length - 1);
        if (postError.startsWith('\n')) postError = postError.substring(1);

        const preErrorSeg = preError.split(/\n/g);
        const postErrorSeg = postError.split(/\n/g);

        const row = preErrorSeg.length;
        const column = preErrorLn.length;

        const caretOffset = preErrorLn.substring(
            0,
            preErrorLn.replace(preErrorLn.trim(), '').length
        );

        if (preErrorSeg.length > 3)
            preError = preErrorSeg.slice(preErrorSeg.length - 3).join('\n');
        if (postErrorSeg.length > 3)
            postError = postErrorSeg.slice(0, 3).join('\n');

        const prettyPrinted = [
            highlight(preError),
            highlight(preErrorLn + postErrorLn),
            caretOffset + chalk.bold.red('^'),
            highlight(postError)
        ].join('\n');

        return { column, row, prettyPrinted };
    }

    /**
     * Duplicates this PgSyntaxError.
     * @param message An error message
     * @param position The position of the error
     * @returns A new PgSyntaxError that shares `raw` and `path`
     * with this instance.
     */
    public fork(message: string, position?: number): PgSyntaxError {
        return new PgSyntaxError(
            message,
            this.raw,
            position ?? this.position,
            this.path
        );
    }
}
