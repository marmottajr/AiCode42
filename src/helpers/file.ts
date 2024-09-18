// src/helpers/file.ts
import { promises as fs } from 'fs';
import { dirname } from 'path';
import log from './log';

/**
 * Creates a directory if it doesn't already exist.
 * @param path - The directory path to create.
 */
async function createDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

/**
 * Saves content to a file, creating directories as needed.
 * @param path - The file path where content should be saved.
 * @param content - The content to save.
 */
export async function saveFile(path: string, content: string): Promise<void> {
  const directory = dirname(path);

  try {
    await createDirectory(directory);
    await fs.writeFile(path, content, 'utf8');
  } catch (error) {
    console.error('Error saving the file:', error);
    throw error;
  }
}

/**
 * Filters out files that already exist.
 * @param files - An array of file paths to check.
 * @returns An array of file paths that do not exist yet.
 */
export async function filterExistingFiles(files: string[]): Promise<string[]> {
  const fileChecks = files.map(async (file) => {
    try {
      await fs.access(file);
      log.warning(`The file already exists:`, file);
      return null;
    } catch {
      // If the file doesn't exist, return it
      return file;
    }
  });

  const results = await Promise.all(fileChecks);
  return results.filter((file): file is string => file !== null);
}
