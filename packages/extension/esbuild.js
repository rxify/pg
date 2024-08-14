//@ts-check

const { build } = require('esbuild');
const { watch } = require('chokidar');
const { join } = require('path');

/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

/** @type BuildOptions */
const baseConfig = {
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV !== 'production'
};

const entryPoint = join(
    __dirname,
    'src',
    'run-sql-webview',
    'webview',
    'main.ts'
);
const outFile = join(__dirname, 'out', 'webview.js');

// Config for webview source code (to be run in a web-based context)
/** @type BuildOptions */
const webviewConfig = {
    ...baseConfig,
    target: 'es2020',
    format: 'esm',
    entryPoints: [entryPoint],
    outfile: outFile
};

(async () => await build(webviewConfig))();

watch(entryPoint).on('change', async () => {
    console.clear();
    console.log('Rebuilding...');
    const { errors, warnings, outputFiles, metafile, mangleCache } =
        await build(webviewConfig);

    if (errors.length > 0) {
        console.error(errors);
        errors.forEach((error) =>
            console.error(
                `> ${error.location?.file}:${error.location?.line}:${error.location?.column}: error: ${error.text}`
            )
        );
    } else {
        console.log('[watch] build finished');
    }
});
