import * as vscode from 'vscode';
import { ExecDoc, ExecStmt } from './types';

/**
 * Creates a new CodeLens
 * @param startLn The line where the command will be inserted
 * @param title The title of the command
 * @param command The vscode command, registered in package.json
 * @param arg The exec argument
 * @returns An initialized CodeLens object
 */
export function codeLens(
    startLn: number,
    title: string,
    command: string,
    arg: ExecDoc | ExecStmt
) {
    const cmd: vscode.Command = {
        title,
        command,
        arguments: [arg]
    };

    return new vscode.CodeLens(new vscode.Range(startLn, 0, startLn, 0), cmd);
}
