// src/utils/configLoader.ts
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { FileConfig } from '../types/fileConfig';

export interface OpenAIConfig {
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
}

export interface AICodeConfig {
  prefix: string;
  fileConfigs: FileConfig[];
}

/**
 * Loads the OpenAI configuration from '~/aicode42/config.json'.
 * Throws an error if the file does not exist or if the 'OPENAI_API_KEY' is missing.
 * @returns The OpenAI configuration object containing 'OPENAI_API_KEY' and 'OPENAI_MODEL'.
 */
export function loadOpenAIConfig(): OpenAIConfig {
  const configPath = join(process.env.HOME || '', '.aicode42', 'config.json');

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}.`);
  }

  try {
    const data = readFileSync(configPath, 'utf-8');
    const config: OpenAIConfig = JSON.parse(data);

    if (!config.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing in the config.json file.');
    }

    return config;
  } catch (error) {
    throw new Error(
      `Error reading config file at ${configPath}: ${(error as Error).message}`,
    );
  }
}

/**
 * Loads the AI Code configuration from '.aicode42.json'.
 * Throws an error if the file does not exist or if the format is invalid.
 * @param fileName - The name of the configuration file (default is '.aicode42.json').
 * @returns The configuration object containing 'fileConfigs'.
 */
export function loadAICodeConfig(fileName = '.aicode42.json'): AICodeConfig {
  const configPath = resolve(fileName);

  if (!existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
  }

  try {
    const configFileContent = readFileSync(configPath, 'utf-8');
    const configJson = JSON.parse(configFileContent);

    // Validate that fileConfigs is present
    if (!Array.isArray(configJson.fileConfigs)) {
      throw new Error(
        'Invalid configuration format: fileConfigs should be an array.',
      );
    }

    return configJson as AICodeConfig;
  } catch (error) {
    throw new Error(
      `Error reading configuration file: ${(error as Error).message}`,
    );
  }
}
