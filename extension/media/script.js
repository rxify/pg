// @ts-check

/**
 * @typedef {{ getState: () => any; setState: (arg: any) => void; postMessage: (arg: any) => void; }} VsCodeApi
 */

/** @type {VsCodeApi} */
// @ts-ignore
const vscode = acquireVsCodeApi();

window.addEventListener('message', (ev) => {
    console.log(ev.data);
});

const body = document.getElementById('test');
