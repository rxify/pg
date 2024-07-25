import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { map, Observable } from 'rxjs';
import { exit } from 'process';
import { appData, prompt } from './internal.js';
import type { QueryText } from './execute.js';

const dirPath = resolve();
const settingsPath = appData('pg-runner');

/**
 * Prompts the user to select an SQL file.
 * @returns The path to an SQL file and whether the file returns cursors
 */
export function selectSqlCli(): Observable<QueryText> {
    let recent = existsSync(settingsPath)
        ? JSON.parse(readFileSync(settingsPath, 'utf-8')).recent
        : null;

    const sqlFiles = readdirSync(dirPath).filter((dir: string) =>
        dir.endsWith('.sql')
    );

    if (sqlFiles.length === 0) {
        console.error(
            'Error: This command must be run in a folder that contains .sql files.'
        );
        exit(0);
    }

    const select_file = 'text';
    const cursor_res = 'cursor_res';

    return prompt<{
        [select_file]: string;
        [cursor_res]: 'Y' | 'N' | 'y' | 'n';
    }>([
        {
            name: select_file,
            type: 'list',
            choices: recent ? [recent, ...sqlFiles] : sqlFiles,
            message: 'Select an SQL file to execute'
        },
        {
            name: cursor_res,
            type: '',
            choices: ['Y', 'N'],
            message: 'Does this function return a cursor? [Y/n]'
        }
    ]).pipe(
        map((answer) => ({
            [select_file]: answer[select_file],
            [cursor_res]:
                answer[cursor_res] === 'Y' || answer[cursor_res] === 'y'
        }))
    );
}
