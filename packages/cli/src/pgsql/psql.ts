import readline from 'node:readline';
import { exit } from 'node:process';

import { Query } from '../execute.js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function psql(rl: readline.Interface) {
    rl.question('psql=# ', (text) => {
        if (text === 'exit') exit();

        if (text.startsWith('/') || text.startsWith('.')) {
            try {
                let path = text;
                if (!existsSync(path)) {
                    path = resolve(text);
                    if (!existsSync(path)) throw 'NO_EXISTS';
                }

                try {
                    text = readFileSync(path, 'utf-8');
                } catch (e) {
                    console.error(e);
                    exit();
                }
            } catch {
                console.error(
                    'The syntax of your command indicated a system path, but we could not resolve it.'
                );
                exit();
            }
        }

        new Query(text).execute().subscribe({
            complete: () => psql(rl)
        });
    });
}

export function startPsql() {
    psql(
        readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    );
}
