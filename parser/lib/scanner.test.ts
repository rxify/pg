import { describe, test } from '@fusion-rx/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from './parse.js';

import { preprocessSQL } from './preprocess.js';

const testPath = resolve('test-sql.sql');
const sql = readFileSync(testPath, 'utf-8');

describe('Can parse SQL', () => {
    test('Can parse tsql', () => {
        preprocessSQL(sql, testPath);
    });

    test('Can validate sql', () => {
        const parsed = preprocessSQL(sql, testPath);
        parse(parsed.formatted, testPath);
    });
});
