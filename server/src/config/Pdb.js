const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' }); 

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    max: 20,
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 2000, 
});


pool.on('connect', () => {
    console.warn('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1); 
});

module.exports = pool;
