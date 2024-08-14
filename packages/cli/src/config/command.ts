import { config } from '../config.js';
import type { Argv } from 'yargs';
import { addConnection, setActiveConnection } from './config-cli.js';

export function registerConfig(yargs: Argv) {
    return yargs.command(
        'connection',
        'Manage database configurations',
        (yargs) => {
            return yargs
                .option('active', {
                    alias: 'a',
                    describe: 'Change the active connection',
                    type: 'boolean'
                })
                .option('add', {
                    describe: 'Add a connection',
                    type: 'boolean'
                })
                .option('list', {
                    alias: 'l',
                    describe: 'List all connections',
                    type: 'boolean'
                })
                .option('update', {
                    alias: 'u',
                    describe: 'Update a connection',
                    type: 'boolean'
                })
                .option('delete', {
                    alias: 'd',
                    describe: 'Delete a PostgreSQL connection',
                    type: 'boolean'
                });
        },
        async (args) => {
            if (args.active) await setActiveConnection();
            if (args.add) await addConnection();
            if (args.delete)
                console.log(JSON.stringify(config.connections, null, 4));
        }
    );
}
