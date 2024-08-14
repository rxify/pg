import { Argv } from 'yargs';
import { readConfig } from './config.js';
import { loadProject } from './project.js';
import { formatErrors, validate } from './validate.js';
import { watch } from 'chokidar';
import { now } from './time.js';

export function registerWorkspace(yargs: Argv) {
    return yargs.command(
        'build',
        'Build a workspace for local validation.',
        (yargs) => {
            return yargs.option('watch', {
                boolean: true,
                description: 'Watch project files for changes and recompile'
            });
        },
        async (yargs) => {
            console.clear();

            if (yargs.watch) {
                console.log(now() + ' Starting compilation...\n');
            } else {
                console.log(now() + ' Starting compilation in watch mode...\n');
            }

            const config = await readConfig();

            if (yargs.watch) {
                watch(config).on('change', () => {
                    console.clear();
                    project = loadProject(config);
                    formatErrors(validate(project), true);
                });
            }

            let project = loadProject(config);
            formatErrors(validate(project), true);
        }
    );
}
