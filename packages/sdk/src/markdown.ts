import chalk from 'chalk';

/**
 * Clean markdown formatting from AI message for console output with proper spacing and styling
 */
function cleanMarkdown(text: string): string {
  // Store code blocks with placeholders
  const codeBlocks: string[] = [];
  let codeBlockIndex = 0;
  
  // Extract and style code blocks
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/g, '').trim();
    const styledCode = createCodeBox(code);
    const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
    codeBlocks.push(styledCode);
    codeBlockIndex++;
    return '\n' + placeholder + '\n';
  });
  
  // Process inline code with color
  text = text.replace(/`([^`]+)`/g, (match, code) => chalk.cyan(code));
  
  // Remove bold but keep text
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  
  // Remove italic but keep text
  text = text.replace(/\*([^*]+)\*/g, '$1');
  
  // Convert headers to uppercase with spacing
  text = text.replace(/^#{1,6}\s+(.+)$/gm, (match, headerText) => 
    '\n' + chalk.bold.yellow(headerText.toUpperCase()) + '\n'
  );
  
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Convert list markers to bullets with proper indentation
  text = text.replace(/^\s*[-*+]\s+/gm, '  • ');
  
  // Convert numbered lists to bullets with proper indentation
  text = text.replace(/^\s*\d+\.\s+/gm, '  • ');
  
  // Clean up multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Restore code blocks
  codeBlocks.forEach((styledCode, index) => {
    text = text.replace(`__CODE_BLOCK_${index}__`, styledCode);
  });
  
  // Add proper spacing around paragraphs
  return text
    .split('\n\n')
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .join('\n\n')
    .trim();
}

/**
 * Create a styled box around code
 */
function createCodeBox(code: string): string {
  const lines = code.split('\n');
  const maxLength = Math.max(...lines.map(line => line.length));
  const width = Math.min(maxLength + 4, 76); // Max 76 chars wide
  
  const topBorder = chalk.gray('┌' + '─'.repeat(width) + '┐');
  const bottomBorder = chalk.gray('└' + '─'.repeat(width) + '┘');
  
  const styledLines = lines.map(line => {
    const paddedLine = line.padEnd(width - 2);
    return chalk.gray('│ ') + chalk.cyan(paddedLine) + chalk.gray(' │');
  });
  
  return [topBorder, ...styledLines, bottomBorder].join('\n');
}

// Test the function
const markdown = `
# Error Analysis

This error occurs because **the variable is undefined**. You need to use \`const\` or \`let\` to declare it.

## Common Causes

- Missing import statement
- Typo in variable name
- Variable not initialized

## Solution

You can fix this by checking the variable declaration:

\`\`\`javascript
const myVar = 'initialized';
console.log(myVar);
\`\`\`

Make sure to use \`const\` for constants and \`let\` for variables.

For more info, see [documentation](https://example.com).
`;

console.log('\n' + '='.repeat(80));
console.log(chalk.bold.green('  FORMATTED OUTPUT WITH COLORS AND BOXES'));
console.log('='.repeat(80) + '\n');
console.log(cleanMarkdown(markdown));
console.log('\n' + '='.repeat(80) + '\n');

// Made with Bob
