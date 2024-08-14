import {
    confirm,
    input,
    number,
    password as passwordInput,
    select
} from '@inquirer/prompts';
import { config, activeConnection, writeConfig } from '../config.js';

export async function addConnection() {
    const name = await input({
        message: 'Connection name:',
        required: true
    });

    const host = await input({
        message: 'PostgreSQL server IP address:',
        required: true,
        default: 'localhost'
    });

    const port = await number({
        message: 'PostgreSQL server port:',
        required: true,
        default: 5432
    });

    const user = await input({
        message: 'PostgreSQL username:',
        required: true,
        default: 'postgres'
    });

    const password = await passwordInput({
        message: 'PostgreSQL password:'
    });

    const database = await input({
        message: 'PostgreSQL database:',
        required: true,
        default: 'postgres'
    });

    config.connections[name] = {
        databases: [database],
        host,
        name,
        password,
        port: port ?? 5432,
        user
    };

    const setAsDefault = await confirm({
        message: 'Would you like to set this as the default connection?',
        default: true
    });

    if (setAsDefault) {
        config.connection = name;
        config.database = database;
    }

    writeConfig();

    return config.connections[name];
}

export async function setActiveConnection() {
    const active = await select({
        message: 'Select the active connection:',
        default: config.database,
        choices: Object.entries(config.connections).map(([key, val]) => {
            return {
                value: key,
                name: `${val.host} | ${val.databases.join(', ')} | ${
                    val.user
                } | ${val.port}`
            };
        })
    });

    config.connection = active;

    writeConfig;

    return activeConnection();
}

export async function setActiveDatabase() {
    const active = await select({
        message: 'Select the active database:',
        default: config.database,
        choices: activeConnection().databases.map((db) => ({
            value: db
        }))
    });

    config.database = active;

    writeConfig();

    return activeConnection();
}
