import { argv } from 'process';
import { cpSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

import { parseArg } from './cli/parse-arg.js';

const args = argv.slice(2);

parseArg(args, {
    long: 'init',
    required: false,
    handler: () => initWorkspace(['cli', 'pg'])
});

parseArg(args, {
    long: 'postbuild',
    required: false,
    handler: () => {
        parseArg(args, {
            long: 'project',
            short: 'p',
            required: true,
            type: 'string',
            handler: (val) => copyPackageJSON(val.value)
        });
    }
});

function initWorkspace(projects: string[]) {
    projects
        .map((pkg) => {
            return {
                outDir: resolve('dist', pkg),
                pkgJsonSrc: resolve('packages', pkg, 'package.json'),
                pkgJsonOut: resolve('dist', pkg, 'package.json')
            };
        })
        .forEach(({ outDir, pkgJsonSrc, pkgJsonOut }) => {
            if (!existsSync(outDir)) {
                mkdirSync(outDir, {
                    recursive: true
                });
            }

            cpSync(pkgJsonSrc, pkgJsonOut);
        });
}

function copyPackageJSON(project: string) {
    initWorkspace([project]);
}
