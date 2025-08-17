import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
  client: 'mysql2',
  connection:{
        host: "127.0.0.1",
        user: "root",
        password: "Souvik771997@#",
        database: "home_decor"
    },
  pool: { min: 2, max: 10 }
});

export default db;