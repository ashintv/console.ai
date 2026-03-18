import { ConsoleAI } from './index.js';

/**
 * Example usage of the Console AI SDK
 * 
 * This demonstrates various ways to track errors with the SDK
 */

async function main() {
  console.log('🤖 Console AI SDK Example\n');
  console.log('Make sure the API server is running on http://localhost:3000\n');

  // Initialize the SDK
  const client = new ConsoleAI({
    apiKey: 'your-api-key-here', // Replace with your actual API key
    baseUrl: 'http://localhost:3000',
    language: 'typescript',
    framework: 'Node.js',
    debug: true,
    autoCapture: false, // Set to true to automatically capture unhandled errors
    metadata: {
      environment: 'development',
      version: '1.0.0',
    },
  });

  console.log('✅ SDK initialized\n');

  // Example 1: Capture a simple error
  console.log('Example 1: Capturing a simple error');
  console.log('=' .repeat(60));
  try {
    throw new Error('Something went wrong in the application');
  } catch (error) {
    try {
      const response = await client.captureError(error as Error, {
        source: 'example.ts',
        metadata: {
          userId: '12345',
          action: 'processData',
        },
      });
      console.log('✓ Error captured:', response.event.id);
      console.log('✓ AI Analysis:', response.event.aiAnalysis?.substring(0, 100) + '...\n');
    } catch (err) {
      console.error('✗ Failed to capture error:', err);
    }
  }

  // Example 2: Capture an exception with context
  console.log('\nExample 2: Capturing exception with context');
  console.log('=' .repeat(60));
  try {
    const user = null;
    // @ts-ignore - intentional error for demo
    console.log(user.name);
  } catch (error) {
    try {
      const response = await client.captureException(error as Error, {
        source: 'user-service.ts',
        metadata: {
          function: 'getUserName',
          userId: 'unknown',
        },
      });
      console.log('✓ Exception captured:', response.event.id);
      console.log('✓ AI Analysis:', response.event.aiAnalysis?.substring(0, 100) + '...\n');
    } catch (err) {
      console.error('✗ Failed to capture exception:', err);
    }
  }

  // Example 3: Capture a message
  console.log('\nExample 3: Capturing a custom message');
  console.log('=' .repeat(60));
  try {
    const response = await client.captureMessage('Database connection timeout', {
      source: 'db-connection.ts',
      metadata: {
        database: 'postgresql',
        timeout: 5000,
        retries: 3,
      },
    });
    console.log('✓ Message captured:', response.event.id);
    console.log('✓ AI Analysis:', response.event.aiAnalysis?.substring(0, 100) + '...\n');
  } catch (err) {
    console.error('✗ Failed to capture message:', err);
  }

  // Example 4: Using context-aware capturer
  console.log('\nExample 4: Using context-aware capturer');
  console.log('=' .repeat(60));
  const apiContext = client.withContext({
    source: 'api-handler.ts',
    metadata: {
      endpoint: '/api/users',
      method: 'POST',
    },
  });

  try {
    throw new Error('API validation failed');
  } catch (error) {
    try {
      const response = await apiContext.captureError(error as Error);
      console.log('✓ Error captured with context:', response.event.id);
      console.log('✓ AI Analysis:', response.event.aiAnalysis?.substring(0, 100) + '...\n');
    } catch (err) {
      console.error('✗ Failed to capture error:', err);
    }
  }

  // Example 5: Wrapping a function
  console.log('\nExample 5: Wrapping a function for automatic error capture');
  console.log('=' .repeat(60));
  
  async function riskyOperation() {
    throw new Error('Operation failed unexpectedly');
  }

  const wrappedOperation = client.wrap(riskyOperation, {
    source: 'operations.ts',
    metadata: {
      operation: 'riskyOperation',
    },
  });

  try {
    await wrappedOperation();
  } catch (error) {
    console.log('✓ Error automatically captured by wrapped function\n');
  }

  // Example 6: Submit error with full details
  console.log('\nExample 6: Submitting error with full details');
  console.log('=' .repeat(60));
  try {
    const response = await client.submitError({
      message: 'TypeError: Cannot read property "length" of undefined',
      stack: `at calculateTotal (utils.ts:42:15)
    at processOrder (order-service.ts:28:10)
    at handleCheckout (checkout.ts:15:5)`,
      source: 'utils.ts',
      language: 'typescript',
      framework: 'Express',
      metadata: {
        function: 'calculateTotal',
        line: 42,
        column: 15,
        severity: 'high',
        tags: ['checkout', 'payment'],
      },
    });
    console.log('✓ Full error submitted:', response.event.id);
    console.log('✓ AI Analysis:', response.event.aiAnalysis?.substring(0, 100) + '...\n');
  } catch (err) {
    console.error('✗ Failed to submit error:', err);
  }

  console.log('\n✅ All examples completed!\n');
  console.log('💡 Tips:');
  console.log('- Set autoCapture: true to automatically track unhandled errors');
  console.log('- Use withContext() to add consistent context to related errors');
  console.log('- Use wrap() to automatically capture errors in async functions');
  console.log('- Add custom metadata to provide more context for AI analysis\n');
}

// Run examples
main().catch(console.error);

// Made with Bob
