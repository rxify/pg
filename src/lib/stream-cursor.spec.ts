import { concatMap } from 'rxjs';
import { Client } from './client.js';
import { testDbParams } from './internal/connection.js';
import { streamCursorQuery } from './stream-cursor.js';

describe('Stream cursor', () => {
    test('Can stream cursor rows', (done) => {
        let count = 0;

        const client = new Client(testDbParams);
        client
            .connect()
            .pipe(
                concatMap((client) =>
                    streamCursorQuery(client['_clientNative'], {
                        text: 'SELECT * FROM get_animals_cursor()'
                    })
                )
            )
            .subscribe({
                next: (res) => {
                    count += 1;
                    expect(res).toEqual({
                        cursor: expect.any(String),
                        value: expect.any(Object)
                    });
                },
                error: () => done(),
                complete: () => {
                    expect(count).toBeGreaterThan(4);
                    client.end().subscribe(() => {
                        done();
                    });
                }
            });
    });
});
