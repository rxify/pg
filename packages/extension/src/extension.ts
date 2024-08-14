import vscode from 'vscode';

import { provideCodeLens } from './run-sql/code-lens-provider';
import { registerRunSql } from './run-sql/command';
import { runSqlWebview } from './run-sql-webview/command';
import { registerFormat } from './format/command';

export function activate(context: vscode.ExtensionContext) {
    provideCodeLens(context);
    registerRunSql(context);
    runSqlWebview(context);
    registerFormat(context);
}

export function deactivate() {}
