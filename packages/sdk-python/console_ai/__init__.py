"""Console AI SDK - AI-powered error logging for Python"""

import json
import requests
import traceback
import sys
from typing import Optional, Dict, Any, Union
from dataclasses import dataclass, asdict


@dataclass
class ConsoleAIConfig:
    """Console AI Configuration"""
    api_key: str
    base_url: str = "http://localhost:3000"
    mode: str = "log"  # 'log' or 'trace'
    language: Optional[str] = None
    framework: Optional[str] = None


class ConsoleAI:
    """
    Console AI - AI-powered error logging

    Drop-in replacement for logging with AI explanations

    Example:
        >>> from console_ai import ConsoleAI
        >>>
        >>> console = ConsoleAI(api_key='your-api-key', mode='log')
        >>>
        >>> try:
        ...     1 / 0
        ... except Exception as e:
        ...     console.error(e)
    """

    def __init__(self, config: Union[ConsoleAIConfig, Dict[str, Any]]):
        """Initialize Console AI with configuration"""
        if isinstance(config, dict):
            config = ConsoleAIConfig(**config)

        self.api_key = config.api_key
        self.base_url = config.base_url
        self.mode = config.mode
        self.language = config.language or self._detect_language()
        self.framework = config.framework

        if not self.api_key:
            raise ValueError("API key is required")

    def error(self, error: Union[Exception, str], *args) -> None:
        """
        Log an error with AI explanation

        Works like logging.error but with AI-powered insights
        """
        message = str(error)
        stack = None
        source = None
        error_function = None
        function_context = None

        if isinstance(error, Exception):
            stack = traceback.format_exc()
            message = str(error)
            source = self._extract_source(stack)
            error_function = self._extract_function(stack)
            function_context = self._extract_function_code(stack)

        payload = {
            "message": message,
            "stack": stack,
            "source": source,
            "errorFunction": error_function,
            "errorContext": function_context,
            "language": self.language,
            "framework": self.framework,
        }

        try:
            response = requests.post(
                f"{self.base_url}/errors",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-API-Key": self.api_key,
                },
                timeout=10,
            )

            if not response.ok:
                raise Exception(f"API error: {response.status_code}")

            result = response.json()

            # Mode: log - Print error + AI explanation
            if self.mode == "log":
                print(f"\n❌ Error: {message}")
                if error_function:
                    print(f"\n📍 Function: {error_function}")
                if function_context:
                    print(f"\n📄 Function Context:\n{function_context}")
                if source:
                    print(f"\n📁 Source: {source}")
                if stack:
                    print("\n📍 Stack Trace:")
                    print(stack)
                if result.get("event", {}).get("aiAnalysis"):
                    print("\n🤖 AI Explanation:")
                    print(self._clean_markdown(result["event"]["aiAnalysis"]))
                print("\n" + "─" * 80 + "\n")

            # Mode: trace - Just save to database (silent)

        except Exception as api_error:
            # Fallback to regular logging if API fails
            print(f"ConsoleAI API Error: {api_error}", file=sys.stderr)
            print(f"Original error: {message}", file=sys.stderr)

    def warn(self, error: Union[Exception, str], *args) -> None:
        """Log a warning (alias for error with lower severity)"""
        return self.error(error, *args)

    def _extract_source(self, stack: str) -> Optional[str]:
        """Extract source file from stack trace"""
        lines = stack.split("\n")
        for line in lines:
            if "file" in line.lower():
                # Extract file path
                import re
                match = re.search(r'File "([^"]+)"', line)
                if match:
                    return match.group(1)
        return None

    def _extract_function(self, stack: str) -> Optional[str]:
        """Extract function name from stack trace"""
        lines = stack.split("\n")
        for line in lines:
            # Looking for lines like: '  File "...", line X, in function_name'
            import re
            match = re.search(r'in\s+(\w+)', line)
            if match:
                return match.group(1)
        return None

    def _extract_function_code(self, stack: str) -> Optional[str]:
        """Extract function code context from stack trace"""
        try:
            import re
            import linecache

            lines = stack.split("\n")
            for line in lines:
                # Extract file path and line number
                match = re.search(r'File "([^"]+)", line (\d+)', line)
                if match:
                    file_path = match.group(1)
                    line_number = int(match.group(2))

                    # Extract surrounding lines for context
                    context_start = max(1, line_number - 3)
                    context_end = line_number + 3

                    context_lines = []
                    for i in range(context_start, context_end + 1):
                        code_line = linecache.getline(file_path, i).rstrip()
                        if code_line:
                            marker = "> " if i == line_number else "  "
                            context_lines.append(f"{marker}{str(i).ljust(4)} | {code_line}")

                    if context_lines:
                        return "\n".join(context_lines)
        except Exception:
            # Silently fail - context is optional
            pass

        return None

    def _clean_markdown(self, text: str) -> str:
        """Clean markdown formatting from AI message"""
        import re

        # Remove code blocks but keep the code
        text = re.sub(r"```[\w]*\n(.*?)\n```", r"\1", text, flags=re.DOTALL)

        # Remove inline code markers but keep text
        text = re.sub(r"`([^`]+)`", r"\1", text)

        # Remove bold but keep text
        text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)

        # Remove italic but keep text
        text = re.sub(r"\*([^*]+)\*", r"\1", text)

        # Convert headers to uppercase
        text = re.sub(r"^#{1,6}\s+(.+)$", r"\n\U\1\n", text, flags=re.MULTILINE)

        # Remove links but keep text
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)

        # Convert lists to bullets
        text = re.sub(r"^\s*[-*+]\s+", r"  • ", text, flags=re.MULTILINE)
        text = re.sub(r"^\s*\d+\.\s+", r"  • ", text, flags=re.MULTILINE)

        # Clean up multiple blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    def _detect_language(self) -> str:
        """Detect programming language"""
        return "python"


def create_console_ai(config: Union[ConsoleAIConfig, Dict[str, Any]]) -> ConsoleAI:
    """Create a Console AI instance"""
    return ConsoleAI(config)


__all__ = ["ConsoleAI", "ConsoleAIConfig", "create_console_ai"]
