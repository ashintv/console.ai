# Console AI Go SDK

AI-powered error tracking and logging for Go applications.

## Installation

```bash
go get github.com/yourusername/console-ai-sdk
```

## Quick Start

```go
package main

import (
	"context"
	"fmt"
	"console-ai-sdk"
)

func main() {
	// Initialize
	console, err := consoleai.New(consoleai.Config{
		APIKey: "your-api-key",
		Mode:   "log",
	})
	if err != nil {
		panic(err)
	}

	ctx := context.Background()

	// Log errors with AI explanations
	err = someFunction()
	if err != nil {
		console.Error(ctx, err)
	}
}

func someFunction() error {
	return fmt.Errorf("something went wrong")
}
```

## Features

- 🤖 AI-powered error explanations
- 📊 Error tracking and monitoring
- 🔍 Stack trace capture
- 🎯 Framework detection
- 🚀 Production-ready

## Configuration

```go
console, err := consoleai.New(consoleai.Config{
	APIKey:    "your-api-key",            // Required
	BaseURL:   "http://localhost:3000",   // Optional
	Mode:      "log",                     // "log" or "trace"
	Language:  "go",                      // Auto-detected
	Framework: "Gin",                     // Optional
})
```

### Modes

- **log**: Print error + AI explanation to stdout
- **trace**: Save error to database silently

## Usage Examples

### Basic Error Logging

```go
package main

import (
	"context"
	"errors"
	"console-ai-sdk"
)

func main() {
	console, _ := consoleai.New(consoleai.Config{
		APIKey: "your-api-key",
	})

	ctx := context.Background()

	err := getUser(123)
	if err != nil {
		console.Error(ctx, err)
	}
}

func getUser(id int) error {
	if id < 0 {
		return errors.New("invalid user id")
	}
	return nil
}
```

### With Gin Framework

```go
package main

import (
	"context"
	"github.com/gin-gonic/gin"
	"console-ai-sdk"
)

var console *consoleai.ConsoleAI

func init() {
	var err error
	console, err = consoleai.New(consoleai.Config{
		APIKey:    "your-api-key",
		Framework: "Gin",
	})
	if err != nil {
		panic(err)
	}
}

func getUsers(c *gin.Context) {
	ctx := context.Background()

	users, err := fetchUsers()
	if err != nil {
		console.Error(ctx, err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"users": users})
}

func main() {
	r := gin.Default()
	r.GET("/api/users", getUsers)
	r.Run(":8080")
}

func fetchUsers() ([]string, error) {
	// Your logic here
	return []string{}, nil
}
```

### With Echo Framework

```go
package main

import (
	"context"
	"net/http"
	"github.com/labstack/echo/v4"
	"console-ai-sdk"
)

var console *consoleai.ConsoleAI

func init() {
	var err error
	console, err = consoleai.New(consoleai.Config{
		APIKey:    "your-api-key",
		Framework: "Echo",
	})
	if err != nil {
		panic(err)
	}
}

func getUsers(c echo.Context) error {
	ctx := context.Background()

	users, err := fetchUsers()
	if err != nil {
		console.Error(ctx, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, users)
}

func main() {
	e := echo.New()
	e.GET("/api/users", getUsers)
	e.Logger.Fatal(e.Start(":8080"))
}

func fetchUsers() ([]string, error) {
	// Your logic here
	return []string{}, nil
}
```

### Middleware Pattern

```go
package main

import (
	"context"
	"github.com/gin-gonic/gin"
	"console-ai-sdk"
)

var console *consoleai.ConsoleAI

func init() {
	var err error
	console, err = consoleai.New(consoleai.Config{
		APIKey: "your-api-key",
	})
	if err != nil {
		panic(err)
	}
}

// Error handling middleware
func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				ctx := context.Background()
				if err, ok := r.(error); ok {
					console.Error(ctx, err)
				}
				c.JSON(500, gin.H{"error": "internal server error"})
			}
		}()
		c.Next()
	}
}

func main() {
	r := gin.Default()
	r.Use(ErrorMiddleware())
	r.Run(":8080")
}
```

## License

ISC
