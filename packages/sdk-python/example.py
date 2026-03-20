"""Example usage of Console AI SDK"""

from console_ai import ConsoleAI

# Initialize Console AI
console = ConsoleAI(
    api_key="your-api-key",
    base_url="http://localhost:3000",
    mode="log",
    framework="Django",
)


def main():
    """Example error logging"""
    try:
        # Simulate an error
        result = 1 / 0
    except Exception as e:
        console.error(e)


def process_user_data(user_id):
    """Example with real logic"""
    try:
        if user_id < 0:
            raise ValueError("Invalid user ID")

        # Process user...
        return {"id": user_id, "name": "User"}
    except Exception as e:
        console.error(e)
        return None


if __name__ == "__main__":
    main()

    # Another example
    user = process_user_data(-1)
    print(f"User: {user}")
