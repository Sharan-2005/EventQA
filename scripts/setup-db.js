import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes('[YOUR-PASSWORD]')) {
  console.error('\n❌ ERROR: Valid DATABASE_URL not found in .env!');
  console.log('Please replace [YOUR-PASSWORD] in your .env file with your actual Supabase database password.');
  console.log('Or run the SQL statements in supabase_schema.sql directly in the Supabase SQL Editor.\n');
  process.exit(1);
}

const { Client } = pg;
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log(' Connected successfully.');

    const sqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying database schema and seed data...');
    await client.query(sql);

    console.log(' Database schema, tables, RLS policies, and sample events created successfully!\n');
  } catch (err) {
    console.error('❌ Database migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
