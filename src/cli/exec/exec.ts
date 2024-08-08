import { existsSync, readFileSync } from 'fs';
import { exit } from 'process';
import { resolve } from 'path';

import { Query } from '../execute.js';

const isPathLike = (val: string) => {
    return val.startsWith('/') || val.startsWith('./');
};

export function exec(
    pathOrScript: string,
    format: 'table' | 'json' = 'json',
    values?: string[],
    cursors = false
) {
    const { script, path } = evalPathOrScript(pathOrScript);
    new Query(script, path, cursors, format, values).execute().subscribe();
}

function evalPathOrScript(path?: string) {
    if (typeof path !== 'string') {
        console.error(`Expected a string, received "${typeof path}".`);
        exit();
    }

    if (isPathLike(path)) {
        if (!existsSync(path)) {
            console.error('Script does not exist at ' + path + '.');
            exit();
        }

        return {
            script: readFileSync(path, 'utf-8'),
            path: resolve(path)
        };
    }

    return { script: path };
}
