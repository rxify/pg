import pg from 'pg';

export declare type Falsy = undefined | null;
export declare type Truthy<T> = NonNullable<T>;

/** Safely assert that val is truthy. */
export const isTruthy = <T>(val: T | Falsy): val is Truthy<T> =>
    val !== undefined && val !== null;

/** Safely assert that val is an object and is truthy. */
export const isTruthyObj = <T extends object>(
    val: T | Falsy
): val is Truthy<T> => isTruthy(val) && typeof val === 'object';

export declare type ClientConfig = pg.ClientConfig;

/** Safely assert the val is a `Client` */
export const isClient = (val: any): val is pg.Client => {
    return isTruthy(val) && val instanceof pg.Client;
};

/** Safely assert that val is a `PoolClient` */
export const isPoolClient = (val: any): val is pg.PoolClient => {
    return isClient(val) && 'release' in val;
};

export declare type QueryConfigValues<I = any[]> = pg.QueryConfigValues<I>;
export declare type QueryArrayConfig<I = any[]> = pg.QueryArrayConfig<I>;
export declare type QueryStreamConfig = {
    batchSize?: number;
    highWaterMark?: number;
    rowMode?: 'array';
    types?: any;
};
export declare type CustomTypesConfig = pg.CustomTypesConfig;
export declare type QueryConfig<I = any[]> = {
    text: string;
    values?: QueryConfigValues<I>;
    types?: CustomTypesConfig | undefined;
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

export declare type QueryResultRow = pg.QueryResultRow;
export declare type QueryResult<T extends QueryResultRow = any> =
    pg.QueryResult<T>;
export declare type QueryArrayResult<R extends any[] = any[]> =
    pg.QueryArrayResult<R>;
export declare type QueryCursorResult = {
    cursor: string;
} & pg.QueryResult<any>;
export declare type QueryCursorRow<T = any> = {
    cursor: string;
    value: T;
};

export declare type Submittable = pg.Submittable;
export declare type Notification = pg.Notification;
