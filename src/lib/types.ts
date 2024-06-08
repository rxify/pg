import pg from 'pg';

export declare type Falsy = undefined | null;
export declare type QueryConfig<I = any[]> = pg.QueryConfig<I>;
export declare type QueryResult<R extends pg.QueryResultRow = any> =
    pg.QueryResult<R>;
export declare type QueryArrayConfig<I = any[]> = pg.QueryArrayConfig<I>;
export declare type QueryConfigValues<I = any[]> = pg.QueryConfigValues<I>;
export declare type QueryArrayResult<R extends any[] = any[]> =
    pg.QueryArrayResult<R>;
export declare type QueryResultRow = pg.QueryResultRow;
export declare type Submittable = pg.Submittable;
export declare type ClientConfig = pg.ClientConfig;
export declare type Notification = pg.Notification;
export declare type PoolClient = pg.PoolClient;
export declare type QueryStreamConfig = {
    batchSize?: number;
    highWaterMark?: number;
    rowMode?: 'array';
    types?: any;
};

export const isTruthy = <T>(val: T | Falsy): val is NonNullable<T> => {
    return val !== undefined && val !== null;
};

export const isTruthyObj = <T extends object>(
    val: T | Falsy
): val is NonNullable<T> => {
    return val !== undefined && val !== null && typeof val === 'object';
};

/** Safely assert that `val` is a `QueryConfig`. */
export const isQueryConfig = <I = any[]>(val: any): val is QueryConfig<I> => {
    return isTruthyObj(val) && 'text' in val;
};

/** Safely assert that `val` is a `QueryConfig`. */
export const isQueryArrayConfig = <I = any[]>(
    val: any
): val is QueryArrayConfig<I> => {
    return isTruthyObj(val) && 'text' in val && 'rowMode' in val;
};
