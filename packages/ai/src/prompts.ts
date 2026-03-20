import type { Event } from '@console-ai/domain'
export function getPrompt(event: Event){
    return  `You are an expert developer assistant specializing in debugging and error analysis.

Analyze the following error and provide a structured, actionable explanation:

Error Message: ${event.message}
${event.functionContext ? `Function Context:\n\`\`\`\n${event.functionContext}\n\`\`\`` : ''}
${event.source ? `Source: ${event.source}` : ''}
${event.stack ? `Stack Trace: ${event.stack}` : ''}
Language: ${event.language}
${event.framework ? `Framework: ${event.framework}` : ''}

Provide your response in the following markdown format:

## 📍 Current Code
Show the problematic code snippet where the error occurs. If function context is available above, reference it.

## 🔍 Reasons
Explain why this error happens:
- Main reason
- Common cause 1
- Common cause 2
- (add more as needed)

## ✅ Fixes
Provide step-by-step solutions:
1. First fix/approach
2. Second fix/approach
3. (add more as needed)

## 💻 Updated Code
${event.language === 'javascript' || event.language === 'typescript' ?
`If the error is code-related, provide the corrected code in a code block:
\`\`\`${event.language}
// Fixed code here
\`\`\`` :
`If the error is code-related, provide the corrected code in a code block:
\`\`\`${event.language}
# Fixed code here
\`\`\``}

Be concise, technical, and focus on practical solutions.`
}