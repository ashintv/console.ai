from setuptools import setup, find_packages

setup(
    name="console-ai",
    version="1.0.0",
    description="Console AI SDK - Client library for error tracking",
    author="Console AI",
    license="ISC",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.28.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "black>=22.0",
            "mypy>=0.9",
        ],
    },
    keywords=[
        "error-tracking",
        "monitoring",
        "ai",
        "console",
    ],
)
