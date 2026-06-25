/**
 * Migration Script Runner
 * Executes the star rating system migration SQL script
 * 
 * Usage: node runMigration.js
 */

const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigration() {
    try {
        console.log('🔧 Starting database migration...');
        console.log('⚠️  WARNING: This will drop and recreate chat_logs and faq_rating_summary tables!');
        console.log('');
        
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'database', 'migration_star_rating.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📄 Executing migration SQL...');
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('📊 Database schema updated:');
        console.log('   - pgvector extension enabled');
        console.log('   - chat_logs table recreated with star rating columns');
        console.log('   - faq_rating_summary table created for semantic deduplication');
        console.log('   - HNSW index created for fast similarity search');
        console.log('');
        console.log('🚀 You can now start the server and use the star rating system!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run migration
runMigration();
