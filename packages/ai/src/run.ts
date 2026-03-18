import { Ai } from './index.js';
import type { Event } from '@console-ai/domain';

async function main() {
    console.log('🤖 Starting AI Error Explanation Generator Test\n');
    
    console.log('📋 Prerequisites:');
    console.log('1. Install Ollama: https://ollama.ai');
    console.log('2. Run: ollama pull llama3.2');
    console.log('3. Ensure Ollama is running (ollama serve)\n');
    
    // Initialize the AI with default config
    const ai = new Ai({
        model: 'llama3.2',
        temperature: 0.7,
        baseUrl: 'http://localhost:11434'
    });

    // Test Case 1: TypeError
    console.log('=' .repeat(60));
    console.log('Test 1: TypeError - Cannot read property of undefined');
    console.log('=' .repeat(60));
    try {
        const event1: Event = {
            message: "TypeError: Cannot read property 'name' of undefined",
            stack: `at getUserName (app.js:15:23)
    at processUser (app.js:42:10)
    at main (app.js:58:5)`,
            source: 'app.js',
            language: 'javascript',
            framework: 'Node.js'
        };
        
        console.log('\n📝 Generating explanation...\n');
        const explanation1 = await ai.generateExplanation(event1);
        console.log('Explanation:', explanation1);
    } catch (err) {
        console.error('Error:', err);
    }

    // Test Case 2: Syntax Error
    console.log('\n\n' + '='.repeat(60));
    console.log('Test 2: SyntaxError - Unexpected token');
    console.log('=' .repeat(60));
    try {
        const event2: Event = {
            message: "SyntaxError: Unexpected token '}' in JSON at position 42",
            stack: `at JSON.parse (<anonymous>)
    at parseConfig (config.js:8:21)
    at loadSettings (config.js:25:15)`,
            source: 'config.js',
            language: 'javascript',
            framework: undefined
        };
        
        console.log('\n📝 Generating explanation...\n');
        const explanation2 = await ai.generateExplanation(event2);
        console.log('Explanation:', explanation2);
    } catch (err) {
        console.error('Error:', err);
    }

    // Test Case 3: ReferenceError
    console.log('\n\n' + '='.repeat(60));
    console.log('Test 3: ReferenceError - Variable not defined');
    console.log('=' .repeat(60));
    try {
        const event3: Event = {
            message: 'ReferenceError: fetch is not defined',
            stack: `at makeApiCall (api.js:12:18)
    at getData (api.js:28:10)
    at async main (index.js:5:3)`,
            source: 'api.js',
            language: 'javascript',
            framework: 'Node.js'
        };
        
        console.log('\n📝 Generating explanation...\n');
        const explanation3 = await ai.generateExplanation(event3);
        console.log('Explanation:', explanation3);
    } catch (err) {
        console.error('Error:', err);
    }

    // Test Case 4: Module Not Found
    console.log('\n\n' + '='.repeat(60));
    console.log('Test 4: Module Not Found Error');
    console.log('=' .repeat(60));
    try {
        const event4: Event = {
            message: "Error: Cannot find module 'express'",
            stack: `Require stack:
- /app/server.js
- /app/index.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1039:15)
    at Module._load (node:internal/modules/cjs/loader:885:27)`,
            source: 'server.js',
            language: 'javascript',
            framework: 'Express'
        };
        
        console.log('\n📝 Generating explanation...\n');
        const explanation4 = await ai.generateExplanation(event4);
        console.log('Explanation:', explanation4);
    } catch (err) {
        console.error('Error:', err);
    }

    console.log('\n\n✅ Test completed!\n');
}

// Run the test
main().catch(console.error);

// Made with Bob
