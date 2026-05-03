import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:GAbrWFtdJgGRmfgzeyGgtlfhcPfmStdD@tramway.proxy.rlwy.net:39404/railway',
  ssl: { rejectUnauthorized: false }
});

async function testLoginSetup() {
  try {
    console.log('\n=== Database & Login System Check ===\n');

    const client = await pool.connect();

    // Check if users table exists and is empty
    const result = await client.query('SELECT COUNT(*) as count FROM users;');
    const userCount = parseInt(result.rows[0].count);

    console.log(`✓ Users table verified (${userCount} users currently)`);

    // Check table structure
    const structureResult = await client.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'users' ORDER BY ordinal_position;`
    );

    console.log('✓ Users table structure:');
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });

    console.log('\n=== Next Steps ===\n');
    console.log('1. Make sure the API server is running (port 3000)');
    console.log('2. Navigate to http://localhost:5173/register');
    console.log('3. Enter your email and password to register');
    console.log('4. Navigate to http://localhost:5173/login');
    console.log('5. Login with your registered credentials');
    console.log('\n✓ Database is ready for authentication!\n');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

testLoginSetup();

