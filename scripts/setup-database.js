const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Create database if not exists
    try {
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Created database: ${process.env.DB_NAME}`);
    } catch (err) {
      if (err.code === '42P04') {
        console.log(`📊 Database ${process.env.DB_NAME} already exists`);
      } else {
        throw err;
      }
    }
    
    await client.end();

    // Connect to our database
    const dbClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    await dbClient.connect();
    console.log(`✅ Connected to database: ${process.env.DB_NAME}`);

    // Drop existing tables
    await dbClient.query(`
      DROP TABLE IF EXISTS ledger_entries CASCADE;
      DROP TABLE IF EXISTS transactions CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
    `);

    // Create tables
    await dbClient.query(`
      CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        account_type VARCHAR(50) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        amount DECIMAL(19,4) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        source_account_id UUID REFERENCES accounts(id),
        destination_account_id UUID REFERENCES accounts(id),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE ledger_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID NOT NULL REFERENCES accounts(id),
        transaction_id UUID NOT NULL REFERENCES transactions(id),
        entry_type VARCHAR(10) NOT NULL,
        amount DECIMAL(19,4) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables created successfully');
    
    // Add sample data
    await dbClient.query(`
      INSERT INTO accounts (user_id, account_type, currency) VALUES
      ('11111111-2222-3333-4444-555555555555', 'checking', 'USD'),
      ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'savings', 'USD')
    `);
    
    console.log('✅ Sample data inserted');
    await dbClient.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();