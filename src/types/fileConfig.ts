// src/types/fileConfig.ts
/**
 * Configuration for file generation.
 */
export type FileConfig = {
  name: string;
  files: string[];
  model?: string;
  prompt?: string;
  system?: string;
  assistantId?: string;
  dependencies?: string[];
};
