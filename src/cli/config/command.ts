import type { Argv } from 'yargs';
import { addConnection, setActiveConnection } from './config-cli.js';
import { config } from '../config.js';
import { Command, Handle, Build } from '@fusion-rx/yargs-di';
import type { ArgvGeneric } from '@fusion-rx/yargs-di';

@Command({
    command: 'connection',
    description: 'Manage database configurations',
    showAppVersion: true,
    showHelp: true
})
export class ConfigCommand {
    @Handle()
    public async handle(
        args: ArgvGeneric<ReturnType<this['build']>>
    ): Promise<void> {
        if (args.active) await setActiveConnection();
        if (args.add) await addConnection();
        if (args.delete)
            console.log(JSON.stringify(config.connections, null, 4));
    }

    @Build()
    public build(yargs: Argv) {
        return yargs
            .positional('connection', {
                describe: 'Does shit'
            })
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
    }
}
