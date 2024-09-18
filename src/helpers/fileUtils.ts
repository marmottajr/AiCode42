// src/helpers/fileUtils.ts
import { promises as fs } from 'fs';

export async function readFileAsync(path: string): Promise<string> {
  return fs.readFile(path, 'utf-8');
}

export async function writeFileAsync(
  path: string,
  data: string,
): Promise<void> {
  await fs.writeFile(path, data);
}
