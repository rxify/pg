import { Argv } from 'yargs';
import { readConfig } from './config.js';
import { createProgram } from './program.js';

export function registerWorkspace(yargs: Argv) {
    return yargs.command(
        'build',
        'Build a workspace for local validation.',
        (yargs) => {
            return yargs.option('watch', {
                boolean: true,
                description: 'Watch project files for changes and recompile',
                default: false
            });
        },
        async (yargs) => {
            const config = await readConfig();
            createProgram(config, yargs.watch);
        }
    );
}
