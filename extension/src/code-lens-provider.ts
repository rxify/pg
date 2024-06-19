import vscode from 'vscode';
import { codeLens } from './util';
import { parse } from './parse';

export class SqlCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const text = document.getText();
        const commands = parse(text, document.uri.path).map((lensPoint) => {
            return codeLens(
                lensPoint.start.lineNum,
                'Run',
                'extension.runSql',
                {
                    cursors: lensPoint.cursors ?? false,
                    stmt: lensPoint.text,
                    description: lensPoint.description
                }
            );
        });

        return commands;
    }
}
