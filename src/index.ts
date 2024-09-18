#!/usr/bin/env node
// src/index.ts

import echoTitle from './helpers/echoTitle';
import log from './helpers/log';
import { CodeGenerator } from './services/codeGenerator';
import { AICodeConfig, loadAICodeConfig } from './utils/configLoader';

async function main() {
  const startTime = Date.now(); // Marca o início da execução
  try {
    await echoTitle('AICode42');

    // Load the configuration file using the separate module
    const aiCodeConfig: AICodeConfig = loadAICodeConfig();

    log.info('Prefix:', aiCodeConfig.prefix);
    console.log('------------------------------------------------------\n');

    // Replace the placeholders {{fileName}} in file paths and dependencies
    const fileConfigs = aiCodeConfig.fileConfigs.map((config) => {
      return {
        name: config.name,
        model: config.model,
        system: config.system,
        prompt: config.prompt,
        assistantId: config.assistantId,
        files: config.files.map((filePath) =>
          filePath.replace(/{{prefix}}/g, aiCodeConfig.prefix),
        ),
        dependencies: config.dependencies
          ? config.dependencies.map((depPath) =>
              depPath.replace(/{{prefix}}/g, aiCodeConfig.prefix),
            )
          : undefined,
      };
    });

    const codeGenerator = new CodeGenerator();
    await codeGenerator.createFiles(fileConfigs);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    console.error('Error:', error);
  }

  // Calcula o tempo final e exibe no formato minutos:segundos
  const endTime = Date.now();
  const timeElapsed = endTime - startTime; // Tempo em milissegundos
  const minutes = Math.floor(timeElapsed / 60000); // Converte para minutos
  const seconds = ((timeElapsed % 60000) / 1000).toFixed(0); // Converte o resto para segundos

  console.log(
    `Execution Time: ${minutes}:${seconds.padStart(2, '0')} (min:sec)`,
  );
}

main();
