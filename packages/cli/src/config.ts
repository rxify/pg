import chalk from 'chalk';
import os from 'os';
import { catchError, Observable } from 'rxjs';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { exit } from 'process';
import { join } from 'path';

import { Client, ClientConfig } from '@rxpg/pg';

export declare type ConnectionConf = {
    name: string;
    user: string;
    password: string;
    port: number;
    host: string;
    databases: string[];
};

export declare type Configuration = {
    connection: string;
    database: string;
    connections: {
        [alias: string]: ConnectionConf;
    };
};

const configPath = join(os.homedir(), 'rxpg-cli.json');

export const config: Configuration = (() => {
    if (existsSync(configPath)) {
        return JSON.parse(readFileSync(configPath, 'utf-8'));
    } else {
        throw new Error(
            'Config does not exist. Initialize it with rxpg --init'
        );
    }
})();

export function activeConnection(): ConnectionConf {
    return config.connections[config.connection];
}

export function activeClientConfig(conf = activeConnection()): ClientConfig {
    return {
        user: conf.user,
        password: conf.password,
        port: conf.port,
        host: conf.host,
        database: config.database
    };
}

export function connectToActive(): Observable<Client> {
    return new Client(activeClientConfig()).connect().pipe(
        catchError((error) => {
            console.error(chalk.red('Connection failed.'));
            console.error(error);
            exit();
        })
    );
}

export function writeConfig(): void {
    writeFileSync(configPath, JSON.stringify(config, null, 4));
}
