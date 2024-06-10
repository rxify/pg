import pg from 'pg';

const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    user: 'test-user',
    database: 'test-db'
});

const connection = await pool.connect();

console.log(connection instanceof pg.Client);

connection.release(true);
