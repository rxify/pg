import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { exit } from 'process';

export declare type ErdConf = {
    schema: string[];
    tables: string[];
};

export const renderErd = () => {
    const erdConfigPath = resolve('erdconfig.json');
    if (!existsSync(erdConfigPath)) {
        console.error(
            'You must run this command in a directory that contains an erdconfig.json file.'
        );
        exit();
    }

    const erdFile = readdirSync(resolve()).find((file) =>
        file.endsWith('.erd')
    );
    if (!erdFile) {
        console.error(
            'You must run this command in a directory that contains an *.erd file.'
        );
        exit();
    }

    let erd = (() => {
        try {
            return readFileSync(erdFile, 'utf-8');
        } catch (e) {
            console.error('Failed to read .erd at ' + erdFile);
            console.error((<Error>e).stack);
            exit();
        }
    })();

    let erdConf = ((): ErdConf => {
        try {
            const erdConfRaw = readFileSync(erdConfigPath, 'utf-8');

            try {
                return JSON.parse(erdConfRaw);
            } catch (e) {
                console.error('Failed to parse erdconfig.json at ' + erdFile);
                console.error((<Error>e).stack);
                exit();
            }
        } catch (e) {
            console.error('Failed to read erdconfig.json at ' + erdFile);
            console.error((<Error>e).stack);
            exit();
        }
    })();

    erdConf.schema.forEach(
        (schema) => (erd = erd.replace(schema, chalk.bold.blue(schema)))
    );

    erdConf.tables.forEach(
        (table) => (erd = erd.replace(table, chalk.bold.green(table)))
    );

    erd = erd.replace(/PK/g, chalk.bold.cyan('PK'));
    erd = erd.replace(/FK/g, chalk.bold.magenta('FK'));
    erd = erd.replace(/ NN /g, chalk.rgb(206, 145, 120)(' NN '));
    erd = erd.replace(/ ID /g, chalk.rgb(208, 220, 170)(' ID '));
    erd = erd.replace(/ ID /g, chalk.rgb(208, 220, 170)(' ID '));
    erd = erd.replace(
        /(═|║|╒|╓|╔|╕|╖|╗|╘|╙|╚|╛|╜|╝|╞|╟|╠|╡|╢|╣|╤|╥|╦|╧|╨|╩|╪|╫|╬)/g,
        chalk.red('$1')
    );
    erd = erd.replace(/(┐|┌|└|┘|>|<|│|─|─)/g, chalk.red('$1'));
    erd = erd.replace(/(┊)/g, chalk.gray('│'));
    erd = erd.replace(/(╍)/g, chalk.gray('─'));
    erd = erd.replace(/(╰|╯|╭|╮|├|┤|┴|┬)/g, chalk.gray('$1'));

    console.log(erd);
};
