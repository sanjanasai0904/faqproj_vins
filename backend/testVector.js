/**
 * Test if pgvector is working
 */

const pool = require('./config/db');

async function testVector() {
    try {
        console.log('🧪 Testing pgvector...');
        
        // Test 1: Check if vector extension exists
        const extCheck = await pool.query("SELECT * FROM pg_extension WHERE extname = 'vector'");
        console.log(`   Extension check: ${extCheck.rows.length > 0 ? '✅ Installed' : '❌ Not installed'}`);
        
        if (extCheck.rows.length === 0) {
            console.log('   ⚠️  pgvector extension is not installed!');
            process.exit(0);
        }
        
        // Test 2: Try inserting a vector
        const vectorString = '[0.1,0.2,0.3]';
        console.log(`\n🔬 Testing vector insertion with: ${vectorString}`);
        
        await pool.query('DROP TABLE IF EXISTS test_vectors');
        await pool.query('CREATE TABLE test_vectors (id serial, embedding vector(3))');
        
        await pool.query('INSERT INTO test_vectors (embedding) VALUES ($1::vector)', [vectorString]);
        console.log('   ✅ Vector insertion successful!');
        
        // Test 3: Query the vector
        const result = await pool.query('SELECT embedding FROM test_vectors LIMIT 1');
        console.log(`   ✅ Vector retrieved: ${JSON.stringify(result.rows[0])}`);
        
        // Cleanup
        await pool.query('DROP TABLE test_vectors');
        
        console.log('\n🎉 pgvector is working correctly!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testVector();
