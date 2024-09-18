// src/openai/openaiConfig.ts
import { OpenAI } from 'openai';
import { loadOpenAIConfig } from '../utils/configLoader';

const config = loadOpenAIConfig();

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export default openai;
