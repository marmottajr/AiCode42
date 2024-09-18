// src/helpers/string.ts
/**
 * Extracts the table name from a SQL CREATE TABLE statement.
 * @param sql - The SQL string containing the CREATE TABLE statement.
 * @returns The table name, or null if not found.
 */
export function extractTableName(sql: string): string | null {
  // Regex to capture the table name between backticks or quotes after "CREATE TABLE"
  const regex = /CREATE TABLE\s+[`'"]?([^\s`'"]+)[`'"]?/i;
  const match = regex.exec(sql);

  if (match && match.length > 1) {
    return match[1];
  } else {
    return null;
  }
}

/**
 * Extracts TypeScript code blocks from a text.
 * @param text - The text to search for TypeScript code blocks.
 * @returns An array of TypeScript code strings.
 */
export function extractTypescriptCodes(text: string): string[] {
  const regexTypescript = /```typescript\s*([\s\S]*?)\s*```/gi;
  const regexGeneric = /```(?:[a-z]+)?\s*([\s\S]*?)\s*```/gi;
  const codes: string[] = [];
  let match;

  // First, try to find code blocks with ```typescript
  while ((match = regexTypescript.exec(text)) !== null) {
    const code = match[1].trim();
    codes.push(code);
  }

  // If no TypeScript code blocks are found, try generic code blocks ```
  if (codes.length === 0) {
    while ((match = regexGeneric.exec(text)) !== null) {
      const code = match[1].trim();
      codes.push(code);
    }
  }

  // If still no code is found, return the complete text as the only element
  if (codes.length === 0) {
    codes.push(text.trim());
  }

  return codes;
}

/**
 * Extracts the file name from a given text.
 * @param text - The text containing the file name.
 * @returns The file name, or null if not found.
 */
export function extractFileName(text: string): string | null {
  const regex = /\/\/\s*([\w\-./]+\.\w+)/;
  const match = regex.exec(text);

  if (match && match[1]) {
    return match[1].trim(); // Returns the full file name
  }

  return null; // Returns null if not found
}

/**
 * Converts a string from underscore_case to camelCase.
 * @param text - The text to convert.
 * @returns The camelCase version of the text.
 */
export function underscoreToCamelCase(text: string): string {
  return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Optimizes input text for GPT processing by removing non-ASCII characters
 * and unnecessary repeated characters.
 * @param inputText - The text to optimize.
 * @returns The optimized text.
 */
export function optimizeForGPT(inputText: string): string {
  // Replace non-ASCII characters with their closest ASCII equivalents
  let optimizedText = inputText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Remove or replace other characters that may consume many tokens
  // (this step can be customized according to your needs)
  optimizedText = optimizedText.replace(/[^a-zA-Z0-9\s.,!?']/g, '');

  // Remove unnecessary repeated whitespace characters
  optimizedText = optimizedText.replace(/\s{2,}/g, ' ').trim();

  return optimizedText;
}
