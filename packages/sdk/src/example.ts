import { ConsoleAI } from './index.js';

/**
 * Simple example showing ConsoleAI as a drop-in replacement for console.error
 */

async function main() {
  console.log('🤖 Console AI SDK - Simple Example\n');
  console.log('This SDK is a drop-in replacement for console.error with AI explanations\n');

  // Initialize ConsoleAI
  const consoleAI = new ConsoleAI({
    apiKey: 'your-api-key-here', // Replace with your actual API key
    mode: 'log', // 'log' = print to console, 'trace' = save to database only
    language: 'typescript',
    framework: 'Node.js',
  });

  console.log('✅ ConsoleAI initialized in "log" mode\n');
  console.log('In "log" mode: Errors are printed with AI explanations');
  console.log('In "trace" mode: Errors are saved to database (silent)\n');

  // Example 1: Simple error
  console.log('Example 1: TypeError');
  console.log('=' .repeat(60));
  try {
    const user = null;
    // @ts-ignore
    console.log(user.name);
  } catch (error) {
    await consoleAI.error(error);
  }

  // Example 2: Custom error message
  console.log('\nExample 2: Custom error message');
  console.log('=' .repeat(60));
  await consoleAI.error('Database connection failed');

  // Example 3: Error with stack trace
  console.log('\nExample 3: Error with stack trace');
  console.log('=' .repeat(60));
  try {
    throw new Error('Payment processing failed');
  } catch (error) {
    await consoleAI.error(error);
  }

  console.log('\n✅ All examples completed!\n');
  console.log('💡 Usage:');
  console.log('  const consoleAI = new ConsoleAI({ apiKey: "key", mode: "log" });');
  console.log('  consoleAI.error(error); // Instead of console.error(error)\n');
}

main().catch(console.error);

// Made with Bob
