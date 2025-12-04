// Create a non-root MySQL user for local development and grant privileges
// Usage: node scripts/create_mysql_user.js

const mysql = require('mysql2/promise');

async function main() {
  // Adjust these if your root user has a password
  const rootConfig = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  };

  const dbName = 'document_approval_db';
  const appUser = 'appuser';
  const appPass = 'AppUserPass123!';

  try {
    const conn = await mysql.createConnection(rootConfig);
    console.log('Connected to MySQL as root');

    // Create database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database ${dbName} ensured`);

    // Create user (if not exists) and grant privileges
    await conn.query(`CREATE USER IF NOT EXISTS '${appUser}'@'127.0.0.1' IDENTIFIED BY '${appPass}';`);
    await conn.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${appUser}'@'127.0.0.1';`);
    await conn.query('FLUSH PRIVILEGES;');

    console.log(`Created user '${appUser}' and granted privileges on ${dbName}`);
    await conn.end();
    console.log('Done. You can now use the following connection string in `.env.local`');
    console.log(`DATABASE_URL="mysql://${appUser}:${appPass}@127.0.0.1:3306/${dbName}"`);
  } catch (err) {
    console.error('Error creating DB/user:', err.message || err);
    process.exitCode = 1;
  }
}

main();
