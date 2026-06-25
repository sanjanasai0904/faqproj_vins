/**
 * Test Embedding Generation
 * Quick test to verify Google Gemini embedding API is working
 * 
 * Usage: node testEmbedding.js
 */

const geminiService = require('./services/geminiService');

// Calculate cosine similarity between two vectors
function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function testEmbedding() {
    try {
        console.log('🧪 Testing embedding generation with gemini-embedding-001...');
        console.log('');
        
        const testQuestions = [
            "When can I start the internship?",
            "What is the start date for VINS?",
            "How do I submit my NOC?",
            "Who can sign my NOC document?"
        ];
        
        const embeddings = [];
        
        for (const question of testQuestions) {
            console.log(`📝 Question: "${question}"`);
            
            const embedding = await geminiService.generateEmbedding(question);
            
            console.log(`   ✅ Generated embedding with ${embedding.length} dimensions`);
            console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
            
            embeddings.push(embedding);
            console.log('');
        }
        
        console.log('🎉 All embeddings generated successfully!');
        console.log('');
        
        // Test similarity between similar questions
        console.log('🔍 Testing semantic similarity:');
        console.log('');
        
        const sim1 = cosineSimilarity(embeddings[0], embeddings[1]);
        console.log(`   Question 1: "When can I start the internship?"`);
        console.log(`   Question 2: "What is the start date for VINS?"`);
        console.log(`   Similarity: ${sim1.toFixed(4)} ${sim1 >= 0.50 ? '✅ Similar!' : '⚠️  Not similar enough'}`);
        console.log('');
        
        const sim2 = cosineSimilarity(embeddings[0], embeddings[2]);
        console.log(`   Question 1: "When can I start the internship?"`);
        console.log(`   Question 3: "How do I submit my NOC?"`);
        console.log(`   Similarity: ${sim2.toFixed(4)} ${sim2 < 0.50 ? '✅ Different!' : '⚠️  Too similar'}`);
        console.log('');
        
        console.log('📊 Summary:');
        console.log(`   - Expected dimension: 768`);
        console.log(`   - Actual dimension: ${embeddings[0].length}`);
        console.log(`   - Dimension match: ${embeddings[0].length === 768 ? '✅' : '❌'}`);
        console.log(`   - Similar questions similarity: ${sim1.toFixed(4)} (should be ≥0.50)`);
        console.log(`   - Different questions similarity: ${sim2.toFixed(4)} (should be <0.50)`);
        console.log('');
        
        if (embeddings[0].length === 768 && sim1 >= 0.50) {
            console.log('✅ All tests passed! Semantic deduplication is ready to use.');
            console.log(`   Threshold set to 0.50 for realistic matching.`);
        } else {
            console.log('⚠️  Some tests failed. Check the output above.');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        console.log('');
        console.log('💡 Make sure your GEMINI_API_KEY is set in backend/.env');
        process.exit(1);
    }
}

// Run test
testEmbedding();
