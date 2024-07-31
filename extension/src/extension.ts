import vscode from 'vscode';

import { provideCodeLens } from './run-sql/code-lens-provider';
import { registerRunSql } from './run-sql/command';
import { runSqlWebview } from './run-sql-webview/command';

export function activate(context: vscode.ExtensionContext) {
    provideCodeLens(context);
    registerRunSql(context);
    runSqlWebview(context);
}

export function deactivate() {}
