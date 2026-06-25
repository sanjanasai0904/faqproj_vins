/**
 * Quick Database Connection Test
 * Tests if PostgreSQL connection is working
 */

const pool = require('./config/db');

async function testConnection() {
    console.log('🔍 Testing PostgreSQL connection...\n');
    
    try {
        // Try to connect
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL!');
        
        // Get database info
        const result = await client.query('SELECT version()');
        console.log('📊 PostgreSQL Version:', result.rows[0].version);
        
        // Check if faqs table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'faqs'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ Table "faqs" exists');
            
            // Count rows in faqs table
            const countResult = await client.query('SELECT COUNT(*) FROM faqs');
            console.log(`📝 Number of FAQs in database: ${countResult.rows[0].count}`);
        } else {
            console.log('⚠️  Table "faqs" does NOT exist. Run the schema.sql file first.');
        }
        
        client.release();
        await pool.end();
        
        console.log('\n✅ Connection test PASSED');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Connection test FAILED\n');
        console.error('Error details:', error.message);
        console.error('\nPossible issues:');
        console.error('1. PostgreSQL is not running');
        console.error('2. Wrong credentials in .env file');
        console.error('3. Database does not exist');
        console.error('4. Wrong host/port configuration');
        
        process.exit(1);
    }
}

testConnection();
