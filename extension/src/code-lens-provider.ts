import vscode from 'vscode';
import { codeLens } from './util';
import { parse } from './parse';

export class SqlCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const text = document.getText();
        const commands = parse(text, document.uri.path).map((lensPoint) => {
            return codeLens(
                lensPoint.startLine,
                lensPoint.title,
                lensPoint.command,
                lensPoint.arg
            );
        });

        return commands;
    }
}
