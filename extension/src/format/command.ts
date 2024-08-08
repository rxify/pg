import vscode from 'vscode';
import { format } from './format';

const formatDocument = () => {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) return;

    const text = activeTextEditor.document.getText();
    const split = text.split(/\n/g);

    const documentRange = new vscode.Range(
        0,
        0,
        split.length,
        split.pop()?.length ?? 0
    );

    const formatted = format(text);
    activeTextEditor.edit((editBuilder) => {
        editBuilder.replace(documentRange, formatted);
    });
};

export const registerFormat = (context: vscode.ExtensionContext) => {
    const cmd = vscode.commands.registerCommand('pgRunner.format', () => {
        formatDocument();
    });
    context.subscriptions.push(cmd);
};
