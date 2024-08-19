import { glob } from 'glob';
import { loadProject } from './project.js';
import { validate } from './validate.js';

import { watch } from 'chokidar';
import { now } from './time.js';
import { formatErrors } from './validate.js';
import { PgConfig } from './config.js';

export async function createProgram(
    applicationConfig: PgConfig,
    watchMode = false
) {
    console.clear();

    if (watchMode) {
        console.log(now() + ' Starting compilation in watch mode...\n');
    } else {
        console.log(now() + ' Starting compilation...\n');
    }

    const projectFiles = await readProgramFiles(applicationConfig);

    if (watchMode) {
        watch(projectFiles)
            .on('change', async () => {
                console.clear();
                const { errors } = await compileProgram(projectFiles);
                formatErrors(errors, true);
            })
            .on('add', () => {})
            .on('unlink', () => {});
    }

    console.clear();
    const { errors } = await compileProgram(projectFiles);
    formatErrors(errors, true);
}

export async function compileProgram(projectFiles: string[]) {
    const project = loadProject(projectFiles);
    return {
        project,
        errors: validate(project)
    };
}

export async function readProgramFiles(applicationConfig: PgConfig) {
    return glob(applicationConfig.include, {
        ignore: applicationConfig.exclude,
        absolute: true
    });
}
