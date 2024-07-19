import { Color } from '../color';
import { isTruthy } from '../truthy';

export const isPgSyntaxError = (
    val: PgSyntaxError | any
): val is PgSyntaxError => {
    return (
        typeof val === 'object' &&
        'received' in val &&
        'position' in val &&
        'script' in val &&
        'source' in val
    );
};

const handleArgs = (args: any[]) => {
    if (args.length === 2) {
        let expected = args[0];
        let received = args[1];

        const exp = (Array.isArray(expected) ? expected : [expected]).map(
            (exp) => `"${exp}"`
        );

        return `Syntax Error: Expected ${exp.join(' or ')} but received "${received}".`;
    }

    return args[0];
};

export class PgSyntaxError extends SyntaxError {
    public expected?: string | string[];
    public received?: string;

    public context: string;
    public lineNumber: {
        row: number;
        col: number;
    };

    constructor(
        position: number,
        script: string,
        source: string,
        message: string
    );

    constructor(
        position: number,
        script: string,
        source: string,
        expected: string | string[],
        received: string
    );

    constructor(
        public position: number,
        public script: string,
        public source: string,
        ...args: [string | string[], string] | [string]
    ) {
        super(handleArgs(args));
        this.context = this._getContext() ?? '';
        this.lineNumber = this._getLineNumber();

        if (args.length === 2) {
            this.expected = args[0];
            this.received = args[1];
        }
    }

    override toString() {
        return (
            Color.blue(this.source) +
            (this.lineNumber
                ? Color.white(':') +
                  Color.yellow(this.lineNumber.row) +
                  Color.white(':') +
                  Color.yellow(this.lineNumber.col)
                : '') +
            Color.gray(': ') +
            Color.white(this.message) +
            (this.context ? '\n\n' + Color.white(this.context) + '\n' : '\n')
        );
    }

    private _getContext() {
        if (this.received) {
            const pre = this.script.substring(0, this.position);
            const post = this.script.substring(this.position);

            const underlineStart = this.position - this.received.length;
            let underline = this.script.substring(0, underlineStart);
            underline = underline.replace(/(?!(\s|\t|\n]))./g, ' ');
            underline = underline.split('\n').pop() ?? '';
            underline = underline + '~'.repeat(this.received.length);

            let contextBefore = pre.split('\n');
            let contextAfter = post.split('\n');

            if (contextBefore.length > 3) {
                contextBefore = contextBefore.slice(
                    contextBefore.length - 3,
                    contextBefore.length - 1
                );
            }

            if (contextAfter.length > 3) {
                contextAfter = contextAfter.slice(0, 3);
            }

            return [
                ...contextBefore,
                Color.red(underline),
                ...contextAfter
            ].join('\n');
        }

        return;
    }

    private _getLineNumber() {
        try {
            const split = this.script.substring(0, this.position).split(/\n/g);

            return {
                row: split.length,
                col: split.pop()?.length ?? 0
            };
        } catch (e) {
            return {
                row: 0,
                col: 0
            };
        }
    }
}

export class TsPgError extends SyntaxError {
    constructor(
        message: string,
        public sourcePath: string,
        public context?: string,
        public posn?: {
            col: number;
            row: number;
        }
    ) {
        super(message);
    }
}

export const isTsPgError = (error: any): error is TsPgError => {
    return (
        isTruthy(error) &&
        typeof error === 'object' &&
        'message' in error &&
        'sourcePath' in error
    );
};
