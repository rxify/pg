import pg from 'pg';
import { QueryConfig, QueryConfigValues, QueryResultRow } from './types.js';

export class Query<R extends QueryResultRow = any, I extends any[] = any> {
    private _queryNative: Query<R, I>;

    constructor(
        queryTextOrConfig?: string | QueryConfig<I>,
        values?: QueryConfigValues<I>
    ) {
        this._queryNative = new Query<R, I>(queryTextOrConfig, values);
    }

    on(
        event: 'row',
        listener: (row: any, result?: pg.ResultBuilder<any> | undefined) => void
    ): this;

    on(event: 'error', listener: (err: Error) => void): this;

    on(event: 'end', listener: (result: pg.ResultBuilder<any>) => void): this;

    on(
        event: 'row' | 'error' | 'end',
        listener: (...args: any[]) => void
    ): this {
        switch (event) {
            case 'end':
                this._queryNative.on('end', listener);
                return this;
            case 'error':
                this._queryNative.on('error', listener);
                return this;
            case 'row':
                this._queryNative.on('row', listener);
                return this;
        }
    }

    addListener<K>(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this._queryNative.addListener<K>(eventName, listener);
        return this;
    }

    once<K>(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this._queryNative.once<K>(eventName, listener);
        return this;
    }

    removeListener<K>(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this._queryNative.removeListener<K>(eventName, listener);
        return this;
    }

    off<K>(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this._queryNative.off<K>(eventName, listener);
        return this;
    }

    removeAllListeners(eventName?: string | symbol | undefined): this {
        this._queryNative.removeAllListeners(eventName);
        return this;
    }

    setMaxListeners(n: number): this {
        this._queryNative.setMaxListeners(n);
        return this;
    }

    getMaxListeners(): number {
        return this._queryNative.getMaxListeners();
    }

    listeners<K>(eventName: string | symbol): Function[] {
        return this._queryNative.listeners<K>(eventName);
    }

    rawListeners<K>(eventName: string | symbol): Function[] {
        return this._queryNative.rawListeners<K>(eventName);
    }

    emit<K>(eventName: string | symbol, ...args: any[]): boolean {
        return this._queryNative.emit<K>(eventName, ...args);
    }

    listenerCount<K>(
        eventName: string | symbol,
        listener?: Function | undefined
    ): number {
        return this._queryNative.listenerCount<K>(eventName, listener);
    }

    prependOnceListener<K>(
        eventName: string | symbol,
        listener: (...args: any[]) => void
    ): this {
        this._queryNative.prependOnceListener<K>(eventName, listener);
        return this;
    }

    eventNames(): (string | symbol)[] {
        return this._queryNative.eventNames();
    }
}
