import vscode from 'vscode';

import { SqlCodeLensProvider } from './code-lens-provider';
import { ExecDoc, ExecStmt, isExecDoc } from './types';

/**
 * Finds the existing terminal or creates a new terminal
 * titled `pg-runner`.
 * @param
 */
const getOrCreateTerminal = () => {
    let terminal = vscode.window.terminals.find(
        (terminal) => terminal.name === 'pg-runner'
    );
    if (terminal) return terminal;
    return vscode.window.createTerminal('pg-runner');
};

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'sql', scheme: 'file' },
            new SqlCodeLensProvider()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'extension.runSql',
            async (uriOrStmt: ExecDoc | ExecStmt) => {
                let command: string;

                if (isExecDoc(uriOrStmt)) {
                    const { uri, cursors } = uriOrStmt;
                    command = `npx pg-runner --path ${uri.path}`;
                    if (cursors) command += ' --cursors';
                } else {
                    command = `npx pg-runner --script "${uriOrStmt.stmt}"`;
                    if (uriOrStmt.cursors) command += ' --cursors';
                }

                const terminal = getOrCreateTerminal();
                terminal.show(false);
                terminal.sendText(command);
            }
        )
    );
}

export function deactivate() {}
