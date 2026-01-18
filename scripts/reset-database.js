const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    
    await client.query(`
      DROP TABLE IF EXISTS ledger_entries CASCADE;
      DROP TABLE IF EXISTS transactions CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
    `);
    
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

resetDatabase();