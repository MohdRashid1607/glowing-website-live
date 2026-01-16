// Simple test script to verify chatbot setup
// Run this with: node test-chatbot.js

const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Checking Chatbot Configuration...\n');

// Check if Gemini API key is set
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    console.log('✅ GEMINI_API_KEY is configured');
} else {
    console.log('❌ GEMINI_API_KEY is NOT configured');
    console.log('   Please add your Gemini API key to the .env file');
    console.log('   Get your free key from: https://makersuite.google.com/app/apikey\n');
}

// Check if MongoDB is configured
if (process.env.MONGO_URI && process.env.MONGO_URI !== 'your_mongodb_connection_string') {
    console.log('✅ MONGO_URI is configured');
} else {
    console.log('⚠️  MONGO_URI is NOT configured (required for conversation history)');
}

// Check if required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    './config/chatbotKnowledge.js',
    './controllers/chatbot.js',
    './routes/chatbot.js',
    './models/Conversation.js'
];

console.log('\n📁 Checking Required Files...\n');

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

// Check if package is installed
console.log('\n📦 Checking Dependencies...\n');

try {
    require('@google/generative-ai');
    console.log('✅ @google/generative-ai is installed');
} catch (error) {
    console.log('❌ @google/generative-ai is NOT installed');
    console.log('   Run: npm install @google/generative-ai');
}

console.log('\n' + '='.repeat(50));

if (allFilesExist && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    console.log('✅ Chatbot is ready to use!');
    console.log('   Start the server with: npm run dev');
} else {
    console.log('⚠️  Chatbot setup is incomplete');
    console.log('   Please follow the instructions in CHATBOT_GUIDE.md');
}

console.log('='.repeat(50) + '\n');
