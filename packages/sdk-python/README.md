# Console AI Python SDK

AI-powered error tracking and logging for Python applications.

## Installation

```bash
pip install console-ai
```

## Quick Start

```python
from console_ai import ConsoleAI

# Initialize
console = ConsoleAI(api_key='your-api-key', mode='log')

# Log errors with AI explanations
try:
    result = 1 / 0
except Exception as e:
    console.error(e)
```

## Features

- 🤖 AI-powered error explanations
- 📊 Error tracking and monitoring
- 🔍 Stack trace capture
- 🎯 Framework detection
- 🚀 Production-ready

## Configuration

```python
from console_ai import ConsoleAI

console = ConsoleAI(
    api_key='your-api-key',           # Required
    base_url='http://localhost:3000',  # Optional
    mode='log',                        # 'log' or 'trace'
    language='python',                 # Auto-detected
    framework='Django',                # Optional
)
```

### Modes

- **log**: Print error + AI explanation to console
- **trace**: Save error to database silently

## Usage Examples

### Basic Error Logging

```python
from console_ai import ConsoleAI

console = ConsoleAI(api_key='your-api-key')

try:
    user = get_user(user_id)
except Exception as e:
    console.error(e)
```

### With Django

```python
# settings.py
from console_ai import ConsoleAI

CONSOLE_AI = ConsoleAI(
    api_key='your-api-key',
    framework='Django',
)

# views.py
from django.http import JsonResponse
from settings import CONSOLE_AI

def my_view(request):
    try:
        data = process_data(request.data)
        return JsonResponse(data)
    except Exception as e:
        CONSOLE_AI.error(e)
        return JsonResponse({'error': str(e)}, status=500)
```

### With Flask

```python
# app.py
from flask import Flask
from console_ai import ConsoleAI

app = Flask(__name__)
console_ai = ConsoleAI(
    api_key='your-api-key',
    framework='Flask',
)

@app.route('/api/users')
def get_users():
    try:
        users = fetch_users()
        return {'users': users}
    except Exception as e:
        console_ai.error(e)
        return {'error': str(e)}, 500
```

## License

ISC
