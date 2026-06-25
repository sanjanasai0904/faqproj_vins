/**
 * Create FAQs Table
 * Runs the schema SQL to create the faqs table
 */

const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function createTable() {
    console.log('📋 Creating FAQs table...\n');
    
    try {
        // Read schema SQL file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the schema
        await pool.query(schemaSql);
        
        console.log('✅ FAQs table created successfully!');
        console.log('✅ Sample data inserted!');
        
        // Verify
        const result = await pool.query('SELECT COUNT(*) FROM faqs');
        console.log(`📝 Number of FAQs in database: ${result.rows[0].count}`);
        
        await pool.end();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        await pool.end();
        process.exit(1);
    }
}

createTable();
