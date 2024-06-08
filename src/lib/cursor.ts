import { Connection } from 'pg';
import * as PgCursor from 'pg-cursor';
import { Observable } from 'rxjs';

export class Cursor<T = any> {
    private _cursor: PgCursor;

    constructor(
        query: string,
        values?: any[],
        config?: PgCursor.CursorQueryConfig
    ) {
        this._cursor = new PgCursor(query, values, config);
    }

    submit(connection: Connection) {
        this._cursor.submit(connection);
    }

    read(maxRows: number): Observable<T[]> {
        return new Observable((subscriber) => {
            this._cursor
                .read(maxRows)
                .then((value) => {
                    subscriber.next(value);
                    subscriber.complete();
                })
                .catch((reason) => {
                    subscriber.error(reason);
                });
        });
    }

    close(): Observable<void> {
        return new Observable((subscriber) => {
            this._cursor
                .close()
                .then(() => subscriber.complete())
                .catch((error) => subscriber.error(error));
        });
    }
}
