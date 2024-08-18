import { Argv } from 'yargs';
import { startPsql } from './psql.js';

export function registerPsql(yargs: Argv) {
    return yargs.command(
        'psql',
        'Opens a psql session.',
        (yargs) => yargs.version().help(),
        () => {
            startPsql();
        }
    );
}

// @Command({
//     command: 'psql',
//     description: 'Opens a psql session.',
//     showAppVersion: true,
//     showHelp: true
// })
// export class PsqlCli {
//     @Handle()
//     public handle(): void {
//         startPsql();
//     }
// }
