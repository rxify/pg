import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { exit } from 'process';
import { now } from './time.js';

export declare type PgConfig = {
    include: string[];
    exclude?: string[];
};

export async function readConfig() {
    const path = resolve('pgconfig.json');

    if (!existsSync(path)) {
        console.error(
            now() +
                chalk.red(
                    'This command must be run in a directory with a pgconfig.json file.'
                )
        );
        exit();
    }

    let pgconfigRaw: string | undefined;

    try {
        pgconfigRaw = readFileSync(path, 'utf-8');
    } catch (e) {
        console.error(
            now() + chalk.red('Failed to read pgconfig.json at ' + path + '.')
        );
        exit();
    }

    try {
        return <PgConfig>JSON.parse(pgconfigRaw);
    } catch (e) {
        console.error(
            now() + chalk.red(`Failed to parse pgconfig.json at ${path}.`)
        );
        exit();
    }
}
