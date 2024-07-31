import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { input, number, password } from '@inquirer/prompts';
import { catchError, concatMap, firstValueFrom, Observable, of } from 'rxjs';
import { exit } from 'process';

import chalk from 'chalk';
import os from 'os';

import { Client } from '../lib/client.js';

export declare type Connection = {
    user: string;
    database: string;
    password: string;
    port: number;
    host: string;
};

export declare type Configuration = {
    currentConnection?: string;
    connections: {
        [alias: string]: Connection;
    };
};

const configPath = join(os.homedir(), 'pg-runner-cli.json');
let config: Configuration;

class _PgRunnerConfig {
    /** Whether a configuration file has been written to disk. */
    get exists() {
        return existsSync(configPath);
    }

    get config() {
        return config;
    }

    constructor() {
        if (this.exists) {
            const rawConfig = readFileSync(configPath, 'utf-8');
            config = JSON.parse(rawConfig);
        }
    }

    private async _initialize() {
        const host = await input({
            message: 'What is the IP of your PostgreSQL database?',
            default: 'localhost'
        });
        const port = await number({
            message: 'What is the port of your PostgreSQL database?',
            default: 5432
        });
        const database = await input({
            message: 'What database will you be querying against?',
            default: 'postgres'
        });
        const user = await input({
            message: 'Enter the username that will execute your queries.',
            default: 'postgres'
        });
        const psswd = await password({
            message: 'Please enter the database password.'
        });
        const alias = await input({
            message: 'Create an alias for this connection.'
        });

        const params: Connection = {
            user,
            database,
            port: port ?? 5432,
            host,
            password: psswd
        };

        return firstValueFrom(
            new Client(params).connect().pipe(
                catchError((error) => {
                    console.error(chalk.red('Connection failed'));
                    console.error(error);
                    exit();
                }),
                concatMap((client) => {
                    console.log(chalk.green('Connection established'));
                    this.add(alias, params);
                    return client.end(params);
                })
            )
        );
    }

    get selectedConnection(): Observable<Connection> {
        if (config && config.currentConnection) {
            return of(config.connections[config.currentConnection]);
        } else {
            return new Observable((subscriber) => {
                this._initialize().then((connection) => {
                    subscriber.next(connection);
                    subscriber.complete();
                });
            });
        }
    }

    /**
     * The currently active connection alias.
     */
    set active(alias: string) {
        if (!config.connections[alias]) {
            console.error(chalk.red('The selected alias does not exist.'));
        }
        config.currentConnection = alias;
        this._write();
    }

    /**
     * Adds a connection to the configuration file.
     * @param alias The alias of the connection to add
     * @param params The parameters of the connection to add
     */
    add(alias: string, params: Connection) {
        config.connections[alias] = params;
        config.currentConnection = alias;
        this._write();
    }

    /**
     * Deletes an existing connection from its alias.
     * @param alias The alias of an existing connection
     */
    delete(alias: string) {
        delete config.connections[alias];

        if (config.currentConnection === alias) {
            const connectionAliases = Object.keys(config.connections);

            if (connectionAliases.length === 0) {
                delete config.currentConnection;
                return this._write();
            }

            config.currentConnection = connectionAliases[0];
            return this._write();
        }

        return this._write();
    }

    /**
     * Updates an existing connection.
     * @param alias The alias of an existing connection
     * @param connection The updated connection parameters
     */
    update(alias: string, connection: Connection) {
        config.connections[alias] = connection;
        this._write();
    }

    /**
     * Writes the configuration to disk.
     */
    private _write() {
        writeFileSync(configPath, JSON.stringify(config));
    }
}

export const PgRunnerConfig = new _PgRunnerConfig();
