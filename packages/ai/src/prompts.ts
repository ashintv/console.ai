import type { Event } from '@console-ai/domain'
export function getPrompt(event: Event){
    return  `You are an expert developer assistant specializing in debugging and error analysis.

Analyze the following error and provide a clear, concise explanation using markdown formatting:

Error Message: ${event.message}
${event.stack ? `Stack Trace: ${event.stack}` : ''}
${event.source ? `Source: ${event.source}` : ''}
Language: ${event.language}
${event.framework ? `Framework: ${event.framework}` : ''}

Provide your response in markdown format with:
1. A brief explanation of what caused this error
2. Common reasons why this error occurs (use bullet points or numbered list)
3. Suggested steps to fix it (use numbered list)
`
}