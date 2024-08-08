import { Command, Handle } from '@fusion-rx/yargs-di';
import { renderErd } from './erd.js';

@Command({
    command: 'erd',
    description: 'Renders a colorized erd from a .erd file.'
})
export class ErdCommand {
    @Handle()
    public handle(): void {
        renderErd();
    }
}
