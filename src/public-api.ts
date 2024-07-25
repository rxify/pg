export { Pool } from './lib/pool.js';
export { Client, isClient } from './lib/client.js';
export { ClientBase } from './lib/client-base.js';
export { PoolClient, isPoolClient } from './lib/pool-client.js';

export type {
    ClientConfig,
    Notification,
    QueryArrayConfig,
    QueryArrayResult,
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow,
    QueryStreamConfig
} from './lib/types.js';
export { isQueryArrayConfig, isQueryConfig } from './lib/types.js';
export { stream } from './lib/stream.js';
export { executeCursorQuery } from './lib/cursor.js';
export { streamCursorQuery } from './lib/stream-cursor.js';
export { sql } from './tspg/sql.js';
