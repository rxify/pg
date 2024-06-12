import { concatMap } from 'rxjs';
import { Client } from './client.js';
import { testDbParams } from './internal/connection.js';
import { executeCursorQuery } from './cursor.js';

describe('Cursor', () => {
    test('Can return cursor rows', (done) => {
        const client = new Client(testDbParams);
        client
            .connect()
            .pipe(
                concatMap((client) =>
                    executeCursorQuery(
                        client['_clientNative'],
                        'SELECT * FROM get_animals_cursor()'
                    )
                )
            )
            .subscribe({
                next: (res) => {
                    expect(res.rowCount).toBeGreaterThan(0);
                },
                error: () => done(),
                complete: () => {
                    client.end().subscribe(() => {
                        done();
                    });
                }
            });
    });
});
