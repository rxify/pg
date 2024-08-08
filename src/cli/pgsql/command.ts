import { startPsql } from './psql.js';
import { Command } from '../../yargs-di/di/command.js';
import { Handle } from '@fusion-rx/yargs-di';

@Command({
    command: 'psql',
    description: 'Opens a psql session.',
    showAppVersion: true,
    showHelp: true
})
export class PsqlCli {
    @Handle()
    public handle(): void {
        startPsql();
    }
}
