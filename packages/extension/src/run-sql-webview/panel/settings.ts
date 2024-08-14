import vscode from 'vscode';

export const settings = (
    nonce: string,
    jsUri: vscode.Uri,
    cssUri: vscode.Uri,
    scriptUri: vscode.Uri,
    rawConfig: {
        currentConnection: string;
        connections: Record<string, any>;
    }
) => {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}';">
    <link rel="stylesheet" nonce="${nonce}" src="${cssUri.toString()}" />
    <title>Hello World!</title>
</head>

<body>
    <h1>PostgreSQL Runner</h1>
    <vscode-button id="howdy">Howdy!</vscode-button>

    <section>
        <label for="my-dropdown">Active Connection:</label>
        <vscode-dropdown id="my-dropdown">
            ${Object.keys(rawConfig.connections).map((connection) => {
                return /*html*/ `<vscode-option>${connection}</vscode-option>`;
            })}
        </vscode-dropdown>
    </section>

    <section id="test">
    </section>

    <script type="module" nonce="${nonce}" src="${jsUri}"></script>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>

</html>`;
};
