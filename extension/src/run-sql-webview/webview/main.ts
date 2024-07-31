import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeDropdown,
    vsCodeOption
} from '@vscode/webview-ui-toolkit';

provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeDropdown(),
    vsCodeOption()
);

declare type VsCodeApi = {
    getState: () => any;
    setState: (arg: any) => void;
    postMessage: (arg: any) => void;
};

/** @ts-ignore */
// const vscode: VsCodeApi = acquireVsCodeApi();

// Main function that gets executed once the webview DOM loads
const main = () => {
    // To get improved type annotations/IntelliSense the associated class for
    // a given toolkit component can be imported and used to type cast a reference
    // to the element (i.e. the `as Button` syntax)
    // const howdyButton = document.getElementById('howdy') as Button;
    // howdyButton?.addEventListener('click', handleHowdyClick);
};

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener('load', main);

// Note: If you instead want to send data from the extension context to the
// webview context (i.e. backend to frontend), you can find documentation for
// that here: https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview
// vscode.postMessage({
// command: 'getConfigurations'
// });
