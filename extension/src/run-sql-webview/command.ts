import vscode from 'vscode';

import { HelloWorldPanel } from './panel/panel';

export const runSqlWebview = (context: vscode.ExtensionContext) => {
    const cmd = vscode.commands.registerCommand(
        'extension.runSqlWebview',
        () => {
            // const panel = vscode.window.createWebviewPanel(
            //     '@rxify/pg Webview',
            //     '@rxify/pg Webview',
            //     vscode.ViewColumn.One,
            //     {}
            // );

            // const onDiskPath = join('media', 'styles.css');
            // const stylesSrc = context.asAbsolutePath(onDiskPath);

            HelloWorldPanel.render(context.extensionUri);

            // panel.webview.html = getWebjviewContent(stylesSrc);
        }
    );

    context.subscriptions.push(cmd);
};
