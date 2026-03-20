package main

import (
	"context"
	"fmt"

	consoleai "console-ai-sdk"
)

func main() {
	// Initialize Console AI
	console, err := consoleai.New(consoleai.Config{
		APIKey: "your-api-key",
		Mode:   "log",
	})
	if err != nil {
		fmt.Println("Failed to initialize Console AI:", err)
		return
	}

	ctx := context.Background()

	// Log an error
	err = someFunction()
	if err != nil {
		console.Error(ctx, err)
	}
}

func someFunction() error {
	return fmt.Errorf("something went wrong")
}
