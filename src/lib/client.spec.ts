import { concatMap, finalize } from 'rxjs';
import { Client } from './client.js';
import { testDbParams } from './internal/connection.js';
import { sql } from './sql.js';
import { formatFunction } from './client-base.js';

describe('Client RxJS wrapper', () => {
    test('Can query database table', (done) => {
        new Client(testDbParams)
            .connect()
            .pipe(
                concatMap((client) =>
                    client
                        .query({
                            text: `SELECT * FROM animals`
                        })
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
                .query({
                    text: sql`SELECT * FROM get_animals()`
                })
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
                        .query({
                            text: sql`SELECT * FROM get_animals()`,
                            stream: true
                        })
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

    test('Can stream query cursor results', (done) => {
        new Client(testDbParams)
            .connect()
            .pipe(
                concatMap((client) =>
                    client
                        .query({
                            text: sql`SELECT * FROM get_animals_cursor()`,
                            stream: true,
                            returnsCursors: true
                        })
                        .pipe(finalize(() => client.end().subscribe()))
                )
            )
            .subscribe({
                next: (val) => {
                    expect(val).toEqual({
                        cursor: expect.any(String),
                        value: expect.any(Object)
                    });
                },
                complete: () => done()
            });
    });

    test('Can return query cursor results', (done) => {
        new Client(testDbParams)
            .connect()
            .pipe(
                concatMap((client) =>
                    client
                        .query({
                            text: sql`SELECT * FROM get_animals_cursor()`,
                            stream: true,
                            returnsCursors: true
                        })
                        .pipe(finalize(() => client.end().subscribe()))
                )
            )
            .subscribe({
                next: (val) => {
                    expect(val).toEqual({
                        cursor: expect.any(String),
                        value: expect.any(Object)
                    });
                },
                complete: () => done()
            });
    });

    test('Can format function with one arg', () => {
        const formatted = formatFunction('my_function', 'myschema', ['cat']);
        expect(formatted.text).toEqual(
            'SELECT * FROM myschema.my_function($1)'
        );
    });

    test('Can format function with many args of different types', () => {
        const formatted = formatFunction('my_function', 'myschema', [
            'cat',
            'true',
            '25'
        ]);
        expect(formatted.text).toEqual(
            'SELECT * FROM myschema.my_function($1,$2,$3)'
        );
        expect(formatted.values).toEqual([
            expect.any(String),
            expect.any(Boolean),
            expect.any(Number)
        ]);
    });

    test('Can format function with null arg', () => {
        const formatted = formatFunction('my_function', 'myschema', [
            'cat',
            null,
            '25'
        ]);
        expect(formatted.text).toEqual(
            'SELECT * FROM myschema.my_function($1,NULL,$2)'
        );
        console.log(formatted.values);
        expect(formatted.values).toEqual([
            expect.any(String),
            expect.any(Number)
        ]);
    });
});
