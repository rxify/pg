import { highlight } from 'sql-highlight';
import { chalk } from '../color';

export class PgSyntaxError extends SyntaxError {
    public prettyPrint?: string;

    constructor(
        message: string,
        public path: string,
        public raw: string,
        public position: number
    ) {
        super(message);

        try {
            const { column, row, error } = this._printError(raw, position);

            message =
                `${chalk.blue(path)}:${chalk.yellow(row)}:${chalk.yellow(column)} - ` +
                chalk.red('SyntaxError') +
                chalk.gray(': ') +
                chalk.white(message);

            this.prettyPrint = message + '\n\n' + error;
        } catch {}
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
            ' '.repeat(preErrorLn.length) + chalk.red('^'),
            highlight(postError.slice(0, 4).join('\n'))
        ].join('\n');

        return { column, row, error };
    }
}
