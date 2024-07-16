import vscode from 'vscode';
import { codeLens } from './util';
import { parse } from './parse';

export class SqlCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const text = document.getText();

        let cursors = false;

        text.split(/\n/g).forEach((ln) => {
            if (
                ln.startsWith('--') &&
                ln.includes('@returns') &&
                ln.includes('cursor')
            ) {
                cursors = true;
            }
        });

        const commands = [
            codeLens(0, 'Run File', 'extension.runSql', {
                cursors,
                uri: document.uri
            }),
            ...parse(text, document.uri.path).map((lensPoint) => {
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
            })
        ];

        return commands;
    }
}
