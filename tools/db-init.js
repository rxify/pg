import chalk from 'chalk';
import { oraPromise } from 'ora';
import pg from 'pg';

export const sql = (sql) => sql[0].trim();

const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'test-user',
    database: 'test-db'
});

const drop = () => client.query(sql`DROP TABLE IF EXISTS animals`);
const create = () =>
    client.query(sql`
    CREATE TABLE IF NOT EXISTS animals (
        index
            NUMERIC NOT NULL,
            CONSTRAINT pk_index
               PRIMARY KEY (index),
        name
            CHARACTER VARYING
              COLLATE pg_catalog."default"
                  NOT NULL
    ) WITH (
        OIDS = FALSE
    );
`);
const insert = () =>
    client.query(sql`
    INSERT INTO animals(index, name) VALUES
        (1, 'cat'),
        (2, 'dog'),
        (3, 'goldfish'),
        (4, 'bus');
`);
const fn = () =>
    client.query(sql`
    CREATE OR REPLACE FUNCTION get_animals()
    RETURNS TABLE (
        index NUMERIC,
        name  CHARACTER VARYING
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
        RAISE NOTICE '%', 'notice';
        RETURN QUERY
            SELECT * FROM animals;
    END $$
`);
const fnCursor = () =>
    client.query(sql`
    CREATE OR REPLACE FUNCTION get_animals_cursor()
    RETURNS SETOF refcursor
    LANGUAGE plpgsql
    AS $$
    DECLARE
        cursor_a refcursor := 'cursor_a';
        cursor_b refcursor := 'cursor_b';
    BEGIN
        OPEN cursor_a FOR
            SELECT * FROM animals;
        RETURN NEXT cursor_a;

        OPEN cursor_b FOR
            SELECT * FROM animals;
        RETURN NEXT cursor_b;
    END $$
`);
const test = () => client.query(sql`SELECT * FROM get_animals()`);

await oraPromise(client.connect(), {
    text: 'Connecting to database...',
    successText: 'Connected',
    failText:
        'Failed to connect to database. Did you run \n' +
        chalk.magenta('npm run db:start')
});
await oraPromise(drop(), {
    text: 'Dropping test table if exists...',
    successText: 'Test table dropped',
    failText: 'Failed to drop test table'
});
await oraPromise(create(), {
    text: 'Creating test table...',
    successText: 'Test table "animals" created',
    failText: 'Failed to drop test table'
});
await oraPromise(insert(), {
    text: 'Inserting test data...',
    successText: 'Test data inserted',
    failText: 'Failed to insert test data; unit tests will not pass'
});
await oraPromise(fn(), {
    text: 'Creating test function...',
    successText: 'Test function "get_animals" created',
    failText: 'Failed to create test function; unit tests will not pass'
});
await oraPromise(fnCursor(), {
    text: 'Creating test function...',
    successText: 'Test function "get_animals_cursor" created',
    failText: 'Failed to create test function; unit tests will not pass'
});
const queryRes = await oraPromise(test(), {
    text: 'Validating "get_animals"...',
    successText: '"get_animals" returned:',
    failText: 'Failed to validate "get_animals"; Unit tests may not pass'
});

console.log(
    chalk.green('Query success, returned ' + queryRes.rows.length + ' rows:')
);
console.table(queryRes.rows);

await oraPromise(client.end(), {
    text: 'Ending session...',
    successText: 'Session ended. Test database initialization complete.',
    failText: 'Failed to end session..'
});
