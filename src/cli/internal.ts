import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Observable, concatMap, of } from 'rxjs';
import inquirer, { QuestionCollection } from 'inquirer';
import chalk from 'chalk';
import os from 'os';

import { Client } from '../lib/client.js';

export function prompt<T>(
    questions: QuestionCollection<any>,
    initialAnswers?: Partial<any> | undefined
) {
    return new Observable<T>((subscriber) => {
        inquirer
            .prompt(questions, initialAnswers)
            .then((response) => subscriber.next(response))
            .catch((error) => subscriber.error(error))
            .finally(() => subscriber.complete());
    });
}

const settingsPath = join(os.tmpdir(), 'pg-runner-cli.json');

const input_user = 'user';
const input_database = 'database';
const input_password = 'password';
const input_port = 'port';
const input_host = 'host';

export declare interface InitializeParams {
    [input_user]: string;
    [input_database]: string;
    [input_password]: string;
    [input_port]: number;
    [input_host]: string;
}

const promptInit = () =>
    prompt<InitializeParams>([
        {
            name: input_host,
            type: 'string',
            message: 'What is the IP of your PostgreSQL database?',
            default: 'localhost'
        },
        {
            name: input_port,
            type: 'number',
            message: 'What is the port of your PostgreSQL database?',
            default: 5432
        },
        {
            name: input_database,
            type: 'string',
            message: 'What database will you be querying against?',
            default: 'postgres'
        },
        {
            name: input_user,
            type: 'string',
            message: 'Enter the username that will execute your queries.',
            default: 'postgres'
        },
        {
            name: input_password,
            type: 'password',
            message: 'Please enter the database password.'
        }
    ]).pipe(
        concatMap((params) =>
            new Client(params).connect().pipe(
                concatMap((client) => {
                    console.info('Connection established.');
                    writeFileSync(
                        settingsPath,
                        JSON.stringify(params),
                        'utf-8'
                    );
                    return client.end(params);
                })
            )
        )
    );

/**
 * Prompts user to initialize a Postgresql database. If a new database
 * connection is being created, tests the connection and writes
 * the parameters to {@link __dirname}.
 * @returns An observable of the Postgresql connection parameters
 */
export function initialize(): Observable<InitializeParams> {
    if (existsSync(settingsPath)) {
        try {
            const file = readFileSync(settingsPath, 'utf-8');
            const settings = JSON.parse(file);
            return of(settings);
        } catch (e) {
            console.error(chalk.red('Failed to read config.'));
        }
    }

    return promptInit();
}
