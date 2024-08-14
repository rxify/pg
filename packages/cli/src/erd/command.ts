import { Argv } from 'yargs';
import { renderErd } from './erd.js';

export function registerErd(yargs: Argv) {
    return yargs.command(
        'erd',
        'Renders a colorized erd from a .erd file.',
        (yargs) => yargs.version().help(),
        () => renderErd()
    );
}
