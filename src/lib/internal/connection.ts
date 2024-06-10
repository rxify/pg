import ping from 'ping';
import { ClientConfig } from '../types.js';
import { execSync } from 'child_process';

export const testDbParams: ClientConfig = {
    host: 'localhost',
    port: 5432,
    user: 'test-user',
    database: 'test-db'
};

export const start = async () => {
    const p = await ping.promise.probe(
        `${testDbParams.host}:${testDbParams.port}`
    );

    if (!p.alive) {
        const result = execSync(`npm run db:start`, {
            stdio: ['inherit']
        });
        return result.toString('utf-8');
    }

    return 'already connected';
};
