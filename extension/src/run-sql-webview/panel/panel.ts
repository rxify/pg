import {
    Disposable,
    Webview,
    WebviewPanel,
    window,
    Uri,
    ViewColumn
} from 'vscode';
import { getUri } from '../utilities/get-uri';
import { getNonce } from '../utilities/get-nonce';
import { settings } from './settings';
import { execSync } from 'child_process';

export class HelloWorldPanel {
    public static currentPanel: HelloWorldPanel | undefined;
    private readonly _panel: WebviewPanel;
    private _disposables: Disposable[] = [];

    /**
     * The HelloWorldPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(
            this._panel.webview,
            extensionUri
        );
        this._setWebviewMessageListener(this._panel.webview);
    }

    /**
     * Renders the current webview panel if it exists otherwise a new webview panel
     * will be created and displayed.
     *
     * @param extensionUri The URI of the directory containing the extension.
     */
    public static render(extensionUri: Uri) {
        if (HelloWorldPanel.currentPanel) {
            HelloWorldPanel.currentPanel._panel.reveal(ViewColumn.One);
        } else {
            const panel = window.createWebviewPanel(
                'showPgRunnerUI',
                'PostgreSQL Runner',
                ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [
                        Uri.joinPath(extensionUri, 'out'),
                        Uri.joinPath(extensionUri, 'media')
                    ]
                }
            );

            HelloWorldPanel.currentPanel = new HelloWorldPanel(
                panel,
                extensionUri
            );

            const rawConfig = execSync('pg-runner -c', {
                encoding: 'utf-8'
            });
            const configurations = JSON.parse(rawConfig);
            HelloWorldPanel.currentPanel._panel.webview.postMessage(
                configurations
            );
        }
    }

    public dispose() {
        HelloWorldPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where *references* to CSS and JavaScript files
     * are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        const jsUri = getUri(webview, extensionUri, ['out', 'webview.js']);
        const cssUri = getUri(webview, extensionUri, ['media', 'styles.css']);
        const scriptUri = getUri(webview, extensionUri, ['media', 'script.js']);
        const nonce = getNonce();

        const rawConfig = execSync('pg-runner -c', {
            encoding: 'utf-8'
        });
        const configurations = JSON.parse(rawConfig);

        return settings(nonce, jsUri, cssUri, scriptUri, configurations);
    }

    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     */
    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case 'hello':
                        // Code that should run in response to the hello message command
                        window.showInformationMessage(text);
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }
}
