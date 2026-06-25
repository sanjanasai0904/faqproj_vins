/**
 * Seed Script for FAQs
 * Loads FAQ data from JSON file into PostgreSQL database
 * Usage: npm run seed
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

/**
 * Main seed function
 * Truncates existing data and inserts new FAQs atomically
 */
async function seedFaqs() {
    const client = await pool.connect();
    
    try {
        // Read JSON file
        const jsonPath = path.join(__dirname, 'faqData.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(jsonData);
        
        console.log('📂 Loaded FAQ data from JSON file');
        
        // Start transaction
        await client.query('BEGIN');
        console.log('🔄 Starting database transaction...');
        
        // Truncate table and restart ID sequence
        await client.query('TRUNCATE TABLE faqs RESTART IDENTITY');
        console.log('🗑️  Cleared existing FAQ data');
        
        // Insert each FAQ
        let insertedCount = 0;
        for (const faq of data.faqs) {
            const query = `
                INSERT INTO faqs (question, answer, category)
                VALUES ($1, $2, $3)
            `;
            const values = [faq.question, faq.answer, faq.category];
            
            await client.query(query, values);
            insertedCount++;
        }
        
        // Commit transaction
        await client.query('COMMIT');
        console.log(`✅ Seeded ${insertedCount} FAQs successfully`);
        
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('❌ Error seeding FAQs:', error.message);
        throw error;
        
    } finally {
        // Release client back to pool
        client.release();
        
        // Close pool and exit
        await pool.end();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the seed function
seedFaqs().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
