import { catchError, concatMap, firstValueFrom, of } from 'rxjs';
import { Client } from './client.js';
import { testDbParams } from './internal/connection.js';

describe('client test', () => {
    let client = new Client(testDbParams);

    beforeEach(async () => {
        client = new Client(testDbParams);
        await firstValueFrom(client.connect());
    });

    afterEach(async () => {
        await firstValueFrom(client.end());
    });

    test('can query', async () => {
        const query = await firstValueFrom(
            client.query<{
                a: number;
            }>(`Select 1 + 1 AS a`)
        );
        expect(query.rows).toEqual([
            {
                a: expect.any(Number)
            }
        ]);
    });

    test('emits events', (done) => {
        let _notice: any;

        client.onNotice.subscribe((notice) => {
            _notice = notice;
        });

        client
            .query<{
                a: number;
            }>(`SELECT * FROM one_plus_one()`)
            .pipe(
                catchError(() => of('')),
                concatMap(() => {
                    expect(_notice).toBeTruthy();
                    return client.end();
                })
            )
            .subscribe(() => done());
    });
});
