/**
 * Create Chat Logs Table
 * Runs the SQL to create the chat_logs table
 */

const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function createLogsTable() {
    console.log('📋 Creating chat_logs table...\n');
    
    try {
        // Read SQL file
        const sqlPath = path.join(__dirname, 'database', 'createLogsTable.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL
        await pool.query(sql);
        
        console.log('✅ chat_logs table created successfully!');
        
        // Verify
        const result = await pool.query('SELECT COUNT(*) FROM chat_logs');
        console.log(`📝 Number of logs in database: ${result.rows[0].count}`);
        
        await pool.end();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        await pool.end();
        process.exit(1);
    }
}

createLogsTable();
