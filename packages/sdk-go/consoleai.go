package consoleai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"regexp"
	"runtime/debug"
	"strconv"
	"strings"
	"time"
)

// Config represents Console AI configuration
type Config struct {
	APIKey    string // Required
	BaseURL   string // Default: http://localhost:3000
	Mode      string // "log" or "trace"
	Language  string // Default: "go"
	Framework string
}

// CreateEventInput represents the error payload
type CreateEventInput struct {
	Message       string `json:"message"`
	Stack         string `json:"stack,omitempty"`
	Source        string `json:"source,omitempty"`
	ErrorFunction string `json:"errorFunction,omitempty"`
	ErrorContext  string `json:"errorContext,omitempty"`
	Language      string `json:"language"`
	Framework     string `json:"framework,omitempty"`
}

// ConsoleAI provides AI-powered error logging
type ConsoleAI struct {
	apiKey    string
	baseURL   string
	mode      string
	language  string
	framework string
	client    *http.Client
}

// New creates a new Console AI instance
func New(config Config) (*ConsoleAI, error) {
	if config.APIKey == "" {
		return nil, fmt.Errorf("API key is required")
	}

	if config.BaseURL == "" {
		config.BaseURL = "http://localhost:3000"
	}

	if config.Mode == "" {
		config.Mode = "log"
	}

	if config.Language == "" {
		config.Language = "go"
	}

	return &ConsoleAI{
		apiKey:    config.APIKey,
		baseURL:   config.BaseURL,
		mode:      config.Mode,
		language:  config.Language,
		framework: config.Framework,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}, nil
}

// Error logs an error with AI explanation
func (c *ConsoleAI) Error(ctx context.Context, err error) error {
	if err == nil {
		return nil
	}

	message := err.Error()
	stack := string(debug.Stack())
	source := c.extractSource(stack)
	errorFunction := c.extractFunction(stack)
	errorContext := c.extractFunctionCode(stack)

	payload := CreateEventInput{
		Message:       message,
		Stack:         stack,
		Source:        source,
		ErrorFunction: errorFunction,
		ErrorContext:  errorContext,
		Language:      c.language,
		Framework:     c.framework,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/errors", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.apiKey)

	resp, err := c.client.Do(req)
	if err != nil {
		fmt.Printf("ConsoleAI API Error: %v\n", err)
		fmt.Printf("Original error: %v\n", message)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		fmt.Printf("API error: %d\n", resp.StatusCode)
		return nil
	}

	// Parse response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil
	}

	// Mode: log - Print error + AI explanation
	if c.mode == "log" {
		fmt.Printf("\n❌ Error: %s\n", message)
		if errorFunction != "" {
			fmt.Printf("\n📍 Function: %s\n", errorFunction)
		}
		if errorContext != "" {
			fmt.Printf("\n📄 Function Context:\n%s\n", errorContext)
		}
		if source != "" {
			fmt.Printf("\n📁 Source: %s\n", source)
		}
		fmt.Printf("\n📍 Stack Trace:\n%s\n", stack)

		if event, ok := result["event"].(map[string]interface{}); ok {
			if analysis, ok := event["aiAnalysis"].(string); ok && analysis != "" {
				fmt.Printf("\n🤖 AI Explanation:\n")
				fmt.Printf("%s\n", c.cleanMarkdown(analysis))
			}
		}
		fmt.Printf("\n%s\n\n", strings.Repeat("─", 80))
	}

	return nil
}

// Warn logs a warning (alias for Error with lower severity)
func (c *ConsoleAI) Warn(ctx context.Context, err error) error {
	return c.Error(ctx, err)
}

// extractSource extracts source file from stack trace
func (c *ConsoleAI) extractSource(stack string) string {
	lines := strings.Split(stack, "\n")
	for _, line := range lines {
		if strings.Contains(line, ".go:") {
			// Extract file path and line number
			re := regexp.MustCompile(`(.*?\.go):(\d+)`)
			matches := re.FindStringSubmatch(line)
			if len(matches) > 1 {
				return matches[1]
			}
		}
	}
	return ""
}

// extractFunction extracts function name from stack trace
func (c *ConsoleAI) extractFunction(stack string) string {
	lines := strings.Split(stack, "\n")
	for _, line := range lines {
		// Match function name pattern: "github.com/user/package.FunctionName"
		re := regexp.MustCompile(`(\w+)\(`)
		matches := re.FindStringSubmatch(line)
		if len(matches) > 1 && matches[1] != "go" {
			return matches[1]
		}
	}
	return ""
}

// extractFunctionCode extracts function code context from stack trace
func (c *ConsoleAI) extractFunctionCode(stack string) string {
	lines := strings.Split(stack, "\n")
	for _, line := range lines {
		// Extract file path and line number
		re := regexp.MustCompile(`(.*?\.go):(\d+)`)
		matches := re.FindStringSubmatch(line)
		if len(matches) > 2 {
			filePath := matches[1]
			lineNum, _ := strconv.Atoi(matches[2])

			// Read file and extract context
			if fileContent, err := ioutil.ReadFile(filePath); err == nil {
				sourceLines := strings.Split(string(fileContent), "\n")

				// Extract surrounding lines
				contextStart := lineNum - 4
				if contextStart < 0 {
					contextStart = 0
				}
				contextEnd := lineNum + 3
				if contextEnd > len(sourceLines) {
					contextEnd = len(sourceLines)
				}

				var context []string
				for i := contextStart; i < contextEnd; i++ {
					marker := "  "
					if i == lineNum-1 { // -1 because arrays are 0-indexed
						marker = "> "
					}
					lineNum := i + 1
					context = append(context,
						fmt.Sprintf("%s%d | %s", marker, lineNum, sourceLines[i]))
				}

				return strings.Join(context, "\n")
			}
			break
		}
	}
	return ""
}

// cleanMarkdown cleans markdown formatting from AI message
func (c *ConsoleAI) cleanMarkdown(text string) string {
	// Remove code blocks
	re := regexp.MustCompile("(?s)```[\\w]*\\n(.+?)\\n```")
	text = re.ReplaceAllString(text, "$1")

	// Remove inline code markers
	text = regexp.MustCompile("`([^`]+)`").ReplaceAllString(text, "$1")

	// Remove bold markers
	text = regexp.MustCompile(`\*\*([^*]+)\*\*`).ReplaceAllString(text, "$1")

	// Remove italic markers
	text = regexp.MustCompile(`\*([^*]+)\*`).ReplaceAllString(text, "$1")

	// Convert headers
	text = regexp.MustCompile(`(?m)^#{1,6}\s+(.+)$`).ReplaceAllString(text, "\n$1\n")

	// Remove links but keep text
	text = regexp.MustCompile(`\[([^\]]+)\]\([^)]+\)`).ReplaceAllString(text, "$1")

	// Convert lists to bullets
	text = regexp.MustCompile(`(?m)^\s*[-*+]\s+`).ReplaceAllString(text, "  • ")
	text = regexp.MustCompile(`(?m)^\s*\d+\.\s+`).ReplaceAllString(text, "  • ")

	// Clean up multiple blank lines
	text = regexp.MustCompile(`\n{3,}`).ReplaceAllString(text, "\n\n")

	return strings.TrimSpace(text)
}
