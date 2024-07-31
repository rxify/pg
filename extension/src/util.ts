import { join } from 'path';
import vscode, { Uri, Webview } from 'vscode';

export const isTruthy = <T>(val: T | null | undefined): val is NonNullable<T> =>
    val !== undefined && val !== null;

export function joinPath(
    uri: vscode.Uri,
    ...pathFragment: string[]
): vscode.Uri {
    // Reimplementation of
    // https://github.com/microsoft/vscode/blob/b251bd952b84a3bdf68dad0141c37137dac55d64/src/vs/base/common/uri.ts#L346-L357
    // with Node.JS path. This is a temporary workaround for https://github.com/eclipse-theia/theia/issues/8752.
    if (!uri.path) {
        throw new Error(
            '[UriError]: cannot call joinPaths on URI without path'
        );
    }
    return uri.with({
        path: vscode.Uri.file(join(uri.fsPath, ...pathFragment)).path
    });
}

/**
 * Console foreground colors.
 */
export declare type Color =
    | '\x1b[0m'
    | '\x1b[30m'
    | '\x1b[31m'
    | '\x1b[32m'
    | '\x1b[33m'
    | '\x1b[34m'
    | '\x1b[35m'
    | '\x1b[36m'
    | '\x1b[37m'
    | '\x1b[90m';

/**
 * Determines if val is a Color.
 * @param val Is Color or unkown.
 * @returns True if val is a Color; otherwise, false.
 */
export const isColor = (val: unknown): val is Color =>
    isTruthy<Color> &&
    (val === '\x1b[0m' ||
        val === '\x1b[30m' ||
        val === '\x1b[31m' ||
        val === '\x1b[32m' ||
        val === '\x1b[33m' ||
        val === '\x1b[34m' ||
        val === '\x1b[35m' ||
        val === '\x1b[36m' ||
        val === '\x1b[37m' ||
        val === '\x1b[90m');

/**
 * Console foreground colors.
 */
export namespace chalk {
    export const Reset: Color = '\x1b[0m',
        Black: Color = '\x1b[30m',
        Red: Color = '\x1b[31m',
        Green: Color = '\x1b[32m',
        Yellow: Color = '\x1b[33m',
        Blue: Color = '\x1b[34m',
        Magenta: Color = '\x1b[35m',
        Cyan: Color = '\x1b[36m',
        White: Color = '\x1b[37m',
        Gray: Color = '\x1b[90m';

    export const red = (val: any) => chalk.Red + val + chalk.Reset;
    export const green = (val: any) => chalk.Green + val + chalk.Reset;
    export const yellow = (val: any) => chalk.Yellow + val + chalk.Reset;
    export const blue = (val: any) => chalk.Blue + val + chalk.Reset;
    export const magenta = (val: any) => chalk.Magenta + val + chalk.Reset;
    export const cyan = (val: any) => chalk.Cyan + val + chalk.Reset;
    export const white = (val: any) => chalk.White + val + chalk.Reset;
    export const gray = (val: any) => chalk.Gray + val + chalk.Reset;
}
