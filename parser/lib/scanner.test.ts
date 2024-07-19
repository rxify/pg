import { describe, test } from '@fusion-rx/test';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from './parser.js';

import { preprocessSQL } from './preprocess.js';
import { tokenize } from './tokenize.js';

const testPath = resolve('test-sql.sql');
const sql = readFileSync(testPath, 'utf-8');

describe('Can parse SQL', () => {
    test('Can parse tsql', () => {
        preprocessSQL(sql, testPath);
    });

    test('Can validate sql', () => {
        const tokens = tokenize(sql);
        try {
            const tree = parse(tokens, sql, testPath);
            writeFileSync(
                resolve('test-tree.json'),
                JSON.stringify(tree, null, 4)
            );
        } catch (e) {
            console.log((<any>e).prettyPrint);
        }
    });
});
