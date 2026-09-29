import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('\n❌ Please provide an email address. Example:\n  npm run revoke-admin your_email@example.com\n');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function revokeAdmin() {
  try {
    await client.connect();
    const res = await client.query(
      "UPDATE public.profiles SET role = 'user' WHERE email = $1 RETURNING id, full_name, email, role;",
      [email.trim()]
    );

    if (res.rowCount === 0) {
      console.log(`\n❌ User with email "${email}" not found in profiles table.`);
      console.log('Ensure the user has already signed up via the /register page.\n');
    } else {
      console.log(`\n Successfully REVOKED admin access for "${res.rows[0].email}" (${res.rows[0].full_name}). Role is now: USER.\n`);
    }
  } catch (err) {
    console.error('\n❌ Error revoking role:', err.message);
  } finally {
    await client.end();
  }
}

revokeAdmin();
