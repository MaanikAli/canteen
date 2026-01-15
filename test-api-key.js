#!/usr/bin/env node

console.log('🔍 Testing Gemini API Key Setup...\n');

// Check for API key
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.log('❌ No API key found!');
  console.log('📝 Please set GEMINI_API_KEY in your .env.local file\n');
  console.log('Example:');
  console.log('GEMINI_API_KEY=your_actual_api_key_here\n');
  process.exit(1);
}

if (apiKey === 'your_gemini_api_key_here') {
  console.log('❌ API key is still the placeholder!');
  console.log('📝 Please replace "your_gemini_api_key_here" with your actual API key\n');
  process.exit(1);
}

console.log('✅ API key appears to be configured correctly');
console.log(`🔑 Key starts with: ${apiKey.substring(0, 20)}...`);
console.log('🚀 Your chatbot and AI insights should now work!\n');

console.log('📋 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Test the chatbot (chat icon in bottom-right)');
console.log('3. Check AI Insights page for intelligent recommendations\n');
