import readline from 'node:readline';
import { exit } from 'node:process';

import { Query } from '../execute.js';

export function psql(rl: readline.Interface) {
    rl.question('psql=# ', (text) => {
        if (text === 'exit') exit();
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
