import { concatMap, finalize } from 'rxjs';
import { Client } from './client.js';
import { testDbParams } from './internal/connection.js';
import { sql } from './sql.js';

describe('Client RxJS wrapper', () => {
    test('Can query database table', (done) => {
        new Client(testDbParams)
            .connect()
            .pipe(
                concatMap((client) =>
                    client
                        .query(`SELECT * FROM animals`)
                        .pipe(concatMap((result) => client.end(result)))
                )
            )
            .subscribe((result) => {
                expect(result.rows).toBeTruthy();
                expect(result.rows.length).toBeGreaterThan(1);
                expect(result.rows).toEqual([
                    {
                        index: expect.any(String),
                        name: expect.any(String)
                    },
                    {
                        index: expect.any(String),
                        name: expect.any(String)
                    },
                    {
                        index: expect.any(String),
                        name: expect.any(String)
                    },
                    {
                        index: expect.any(String),
                        name: expect.any(String)
                    }
                ]);
                done();
            });
    });

    test('Can subscribe to events', (done) => {
        let _notice: any;

        new Client(testDbParams).connect().subscribe((client) => {
            client.onNotice.subscribe((notice) => {
                _notice = notice;
            });

            client
                .query(sql`SELECT * FROM get_animals()`)
                .pipe(concatMap((results) => client.end(results)))
                .subscribe(() => {
                    expect(_notice).toBeTruthy();
                    done();
                });
        });
    });

    test('Can stream query results', (done) => {
        new Client(testDbParams)
            .connect()
            .pipe(
                concatMap((client) =>
                    client
                        .stream(sql`SELECT * FROM get_animals()`)
                        .pipe(finalize(() => client.end().subscribe()))
                )
            )
            .subscribe({
                next: (val) => {
                    expect(val).toEqual({
                        index: expect.any(String),
                        name: expect.any(String)
                    });
                },
                complete: () => done()
            });
    });
});
