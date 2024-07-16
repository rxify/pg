import { concatMap, finalize, mergeMap, of } from 'rxjs';
import { sql } from './sql.js';
import { Pool } from './pool.js';
import { ClientConfig } from './types.js';

const testDbParams: ClientConfig = {
    host: 'localhost',
    port: 5432,
    user: 'test-user',
    database: 'test-db'
};

describe('PoolClient RxJS wrapper', () => {
    test('Can create connection pool', (done) => {
        const pool = new Pool(testDbParams);
        pool.connect()
            .pipe(
                concatMap((val) => {
                    const { client } = val;

                    return client
                        .query({
                            text: sql`SELECT * FROM animals`
                        })
                        .pipe(concatMap((result) => client.release(result)));
                }),
                finalize(() => pool.end())
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

    test('Can query database multiple times', (done) => {
        let count = 0;

        const pool = new Pool(testDbParams);
        of(...new Array(10).fill(sql`SELECT * FROM animals`))
            .pipe(
                mergeMap((query: string) =>
                    pool.connect().pipe(
                        concatMap((res) => {
                            const { client } = res;
                            return client
                                .query({
                                    text: query
                                })
                                .pipe(
                                    concatMap((results) => {
                                        count += 1;
                                        return client.release(results);
                                    })
                                );
                        })
                    )
                )
            )
            .subscribe({
                next: (result) => {
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
                },
                complete: () => {
                    expect(count).toEqual(10);
                    pool.end().subscribe(() => done());
                }
            });
    });

    test('Can handle load', (done) => {
        of(...new Array(30).fill(''))
            .pipe(
                mergeMap(() => {
                    const pool = new Pool(testDbParams);
                    return pool.connect().pipe(
                        concatMap((val) => {
                            const { client } = val;

                            return client
                                .query({
                                    text: sql`SELECT * FROM animals`
                                })
                                .pipe(
                                    concatMap((result) =>
                                        client.release(result)
                                    )
                                );
                        }),
                        finalize(() => pool.end())
                    );
                })
            )
            .subscribe({
                next: (val) => {
                    console.log('received value');
                    expect(val).toBeTruthy();
                },
                error: (error) => {
                    expect(error).toBeFalsy();
                    done();
                },
                complete: () => {
                    done();
                }
            });
    });
});
