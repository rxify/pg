import vscode from 'vscode';
import { ExecDoc, ExecStmt, isExecDoc } from './code-lens-provider';

/**
 * Finds the existing terminal or creates a new terminal
 * titled `rxpg`.
 */
const getOrCreateTerminal = () => {
    let terminal = vscode.window.terminals.find(
        (terminal) => terminal.name === 'rxpg'
    );
    if (terminal) return terminal;
    return vscode.window.createTerminal('rxpg');
};

const parseSqlDoc = (text: string) => {
    const params: string[] = [];
    let returnsCursors = false;

    text.split(/\n/g)
        .filter((line) => /^--(\s){0,}@/.test(line))
        .forEach((ln) => {
            if (ln.includes('param')) {
                params.push(ln.slice(ln.indexOf('param')).trim());
            } else if (ln.includes('returns')) {
                if (ln.includes('cursor')) returnsCursors = true;
            }
        });

    return {
        params,
        returnsCursors
    };
};

const command = async (uriOrStmt: ExecDoc | ExecStmt) => {
    let command: string;

    if (isExecDoc(uriOrStmt)) {
        const uri = uriOrStmt.uri;
        const document = await vscode.workspace.openTextDocument(uri);
        const { returnsCursors } = parseSqlDoc(document.getText());

        command = /**/ `rxpg exec ${uri.path}`;

        if (returnsCursors) {
            command += ' --cursors';
        }
    } else {
        command = /**/ `rxpg exec "${uriOrStmt.stmt}"`;

        if (uriOrStmt.cursors) {
            command += ' --cursors';
        }
    }

    const terminal = getOrCreateTerminal();
    terminal.show(false);
    terminal.sendText(command);
};

export const registerRunSql = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('pgRunner.runSql', command)
    );
};
