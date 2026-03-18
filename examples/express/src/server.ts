import express from 'express';
import { ConsoleAI } from '@console-ai/sdk';

const app = express();
const PORT = 2020;

// Initialize Console AI SDK
const consoleAI = new ConsoleAI({
  apiKey: 'cai_Fc-HmKHZ47UA8onKJ9k_AiWnAw3KiRw7VP4ZCN5WGThmJ-Cl', // Replace with your actual API key
  mode: 'trace', // Use 'log' to see AI explanations in console
  language: 'typescript',
  framework: 'Express',
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve HTML form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Console AI SDK Demo</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 2rem;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: white;
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2.5rem;
        }
        .subtitle {
          color: rgba(255,255,255,0.9);
          text-align: center;
          margin-bottom: 3rem;
        }
        .card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h2 {
          color: #667eea;
          margin-bottom: 1rem;
        }
        .description {
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .error-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .error-btn {
          padding: 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }
        .error-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .btn-500 { background: #ef4444; }
        .btn-404 { background: #f59e0b; }
        .btn-403 { background: #ec4899; }
        .btn-timeout { background: #8b5cf6; }
        .btn-db { background: #06b6d4; }
        .btn-validation { background: #10b981; }
        .btn-null { background: #6366f1; }
        .btn-undefined { background: #f97316; }
        .btn-parse { background: #14b8a6; }
        .btn-async { background: #a855f7; }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        input, textarea {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
        }
        input:focus, textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        .submit-btn {
          background: #667eea;
          color: white;
          padding: 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }
        .note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-top: 2rem;
        }
        .note strong {
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Console AI SDK Demo</h1>
        <p class="subtitle">Click buttons to trigger errors and see AI-powered explanations in the terminal</p>

        <!-- Hardcoded Errors -->
        <div class="card">
          <h2>📋 Hardcoded HTTP Errors</h2>
          <p class="description">
            These are simulated HTTP errors. Click any button to trigger the error and see the AI explanation in your terminal.
          </p>
          <div class="error-grid">
            <button class="error-btn btn-500" onclick="triggerError('500')">
              500 Internal Server Error
            </button>
            <button class="error-btn btn-404" onclick="triggerError('404')">
              404 Not Found
            </button>
            <button class="error-btn btn-403" onclick="triggerError('403')">
              403 Forbidden
            </button>
            <button class="error-btn btn-timeout" onclick="triggerError('timeout')">
              Request Timeout
            </button>
            <button class="error-btn btn-db" onclick="triggerError('database')">
              Database Error
            </button>
            <button class="error-btn btn-validation" onclick="triggerError('validation')">
              Validation Error
            </button>
          </div>
        </div>

        <!-- Runtime Errors -->
        <div class="card">
          <h2>⚡ Runtime Errors (Real Code)</h2>
          <p class="description">
            These trigger actual JavaScript errors in the code. Watch the terminal for AI analysis!
          </p>
          <div class="error-grid">
            <button class="error-btn btn-null" onclick="triggerError('null')">
              Null Reference Error
            </button>
            <button class="error-btn btn-undefined" onclick="triggerError('undefined')">
              Undefined Property
            </button>
            <button class="error-btn btn-parse" onclick="triggerError('parse')">
              JSON Parse Error
            </button>
            <button class="error-btn btn-async" onclick="triggerError('async')">
              Async/Await Error
            </button>
          </div>
        </div>

        <!-- Custom Error Form -->
        <div class="card">
          <h2>✏️ Custom Error</h2>
          <p class="description">
            Create your own error message and see what the AI says about it!
          </p>
          <form action="/custom-error" method="POST">
            <input type="text" name="message" placeholder="Error message" required>
            <textarea name="details" rows="3" placeholder="Additional details (optional)"></textarea>
            <button type="submit" class="submit-btn">Submit Custom Error</button>
          </form>
        </div>

        <div class="note">
          <strong>💡 Note:</strong> Check your terminal to see the AI-powered error explanations!
          The SDK sends errors to the API, gets AI analysis, and prints them beautifully formatted.
        </div>
      </div>

      <script>
        async function triggerError(type) {
          try {
            const response = await fetch(\`/trigger/\${type}\`);
            const data = await response.json();
            alert(data.message || 'Error triggered! Check terminal for AI explanation.');
          } catch (error) {
            alert('Error triggered! Check terminal for AI explanation.');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Hardcoded HTTP Errors
app.get('/trigger/500', async (req, res) => {
  const error = new Error('Internal Server Error: Database connection failed');
  await consoleAI.error(error);
  res.status(500).json({ message: 'Error logged! Check terminal.' });
});

app.get('/trigger/404', async (req, res) => {
  const error = new Error('Not Found: The requested resource does not exist');
  await consoleAI.error(error);
  res.status(404).json({ message: 'Error logged! Check terminal.' });
});

app.get('/trigger/403', async (req, res) => {
  const error = new Error('Forbidden: You do not have permission to access this resource');
  await consoleAI.error(error);
  res.status(403).json({ message: 'Error logged! Check terminal.' });
});

app.get('/trigger/timeout', async (req, res) => {
  const error = new Error('Request Timeout: The server took too long to respond');
  await consoleAI.error(error);
  res.status(408).json({ message: 'Error logged! Check terminal.' });
});

app.get('/trigger/database', async (req, res) => {
  const error = new Error('Database Error: Connection to PostgreSQL failed after 3 retries');
  await consoleAI.error(error);
  res.status(500).json({ message: 'Error logged! Check terminal.' });
});

app.get('/trigger/validation', async (req, res) => {
  const error = new Error('Validation Error: Email format is invalid');
  await consoleAI.error(error);
  res.status(400).json({ message: 'Error logged! Check terminal.' });
});

// Runtime Errors (Real Code Errors)
app.get('/trigger/null', async (req, res) => {
  try {
    const user = null;
    // @ts-ignore - intentional error
    console.log(user.name); // This will throw!
  } catch (error) {
    await consoleAI.error(error as Error);
    res.json({ message: 'Null reference error logged! Check terminal.' });
  }
});

app.get('/trigger/undefined', async (req, res) => {
  try {
    const data: any = {};
    console.log(data.user.profile.name); // This will throw!
  } catch (error) {
    await consoleAI.error(error as Error);
    res.json({ message: 'Undefined property error logged! Check terminal.' });
  }
});

app.get('/trigger/parse', async (req, res) => {
  try {
    const invalidJson = '{ "name": "John", invalid }';
    JSON.parse(invalidJson); // This will throw!
  } catch (error) {
    await consoleAI.error(error as Error);
    res.json({ message: 'JSON parse error logged! Check terminal.' });
  }
});

app.get('/trigger/async', async (req, res) => {
  try {
    await Promise.reject(new Error('Async operation failed: Network timeout'));
  } catch (error) {
    await consoleAI.error(error as Error);
    res.json({ message: 'Async error logged! Check terminal.' });
  }
});

// Custom Error Form
app.post('/custom-error', async (req, res) => {
  const { message, details } = req.body;
  const error = new Error(message + (details ? `\nDetails: ${details}` : ''));
  await consoleAI.error(error);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error Logged</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .success-card {
          background: white;
          border-radius: 1rem;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          max-width: 500px;
        }
        h1 { color: #10b981; margin-bottom: 1rem; }
        p { color: #666; margin-bottom: 2rem; line-height: 1.6; }
        a {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        a:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="success-card">
        <h1>✅ Error Logged Successfully!</h1>
        <p>Your custom error has been sent to Console AI for analysis. Check your terminal to see the AI-powered explanation!</p>
        <a href="/">← Back to Demo</a>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🤖 Console AI SDK Demo Server                            ║
║                                                            ║
║  Server running on: http://localhost:${PORT}                  ║
║                                                            ║
║  📝 Instructions:                                          ║
║  1. Open http://localhost:${PORT} in your browser             ║
║  2. Click any error button                                 ║
║  3. Watch this terminal for AI explanations!               ║
║                                                            ║
║  💡 Make sure:                                             ║
║  - Console AI API is running (port 3000)                   ║
║  - You have a valid API key                                ║
║  - Ollama is running for AI analysis                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Made with Bob
