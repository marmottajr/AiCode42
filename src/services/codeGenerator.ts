// src/services/codeGenerator.ts
// import { extractFileName, extractTypescriptCodes } from '../helpers/string';
import { filterExistingFiles, saveFile } from '../helpers/file';
import { sleep } from '../utils/sleep';
import { openAIPrices } from '../constants/openAIPrices';
import { FileConfig } from '../types/fileConfig';
import { readFileAsync } from '../helpers/fileUtils';
import { Usage } from '../types/usage';
import { RetrieveMessage } from '../types/retrieveMessage';
import { Thread } from '../openai/thread';
import log from '../helpers/log';
import { ChatOpenAI } from '../openai/chat';

/**
 * Class that handles code generation using OpenAI's API.
 */
export class CodeGenerator {
  private totalUsage: Usage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  /**
   * Creates code using OpenAI's API.
   * @param message - The message to send to OpenAI.
   * @param openAiModel - The OpenAI model to use.
   * @param initialMessages - Optional initial messages for context.
   * @returns The response message from OpenAI.
   */
  private async createCodeOpenAiThread(
    message: string,
    openAiModel: string,
    initialMessages?: string[] | null,
  ): Promise<RetrieveMessage | null> {
    const thread = new Thread();
    const threadId = await thread.create();

    if (initialMessages) {
      for (const initialMessage of initialMessages) {
        await thread.addMessage(threadId, initialMessage);
      }
    }

    await thread.addMessage(threadId, message);
    const runId = await thread.run(threadId, openAiModel);

    let statusRun = 'running';

    while (statusRun !== 'completed') {
      statusRun = await thread.getRunStatus(threadId, runId);
      await sleep(1000);
    }

    const stepId = await thread.listRunSteps(threadId, runId);
    const messageId = await thread.retrieveMessageId(threadId, runId, stepId);
    const responseAi = await thread.retrieveMessage(threadId, messageId);

    return responseAi;
  }
  private async createCodeOpenAiChat(
    prompt: string,
    openAiModel: string,
    system: string,
    initialMessages?: string[] | null,
  ): Promise<RetrieveMessage | null> {
    const chat = new ChatOpenAI(openAiModel);

    prompt = await readFileAsync(prompt);

    if (system) {
      system = await readFileAsync(system);
      chat.addSystem(system);
    }

    if (initialMessages) {
      for (const initialMessage of initialMessages) {
        chat.addMessage('user', initialMessage);
      }
    }

    chat.addMessage('user', prompt);

    const responseAi = await chat.run();

    return responseAi;
  }

  /**
   * Creates code files based on the model and content provided.
   * @param name - The name type to generate code for.
   * @param content - The content to be processed.
   * @param files - An array of file paths.
   * @param dependencies - Optional dependencies needed for code generation.
   * @returns The usage statistics from OpenAI.
   */
  public async createCode(fileConfig: FileConfig): Promise<Usage> {
    const { model, system, assistantId, files, prompt, dependencies } =
      fileConfig;
    const initialMessages: string[] = [];

    if (dependencies) {
      for (const dependency of dependencies) {
        const fileContent = await readFileAsync(dependency);
        initialMessages.push(fileContent);
      }
    }

    initialMessages.push(files.join('\n'));
    let response: RetrieveMessage | null = null;
    if (!assistantId) {
      response = await this.createCodeOpenAiChat(
        prompt,
        model,
        system,
        initialMessages,
      );
    } else {
      response = await this.createCodeOpenAiThread(
        prompt,
        assistantId,
        initialMessages,
      );
    }

    if (!response || !response.text) {
      throw new Error('No response received from OpenAI.');
    }

    const filesGeraded = JSON.parse(response.text);

    if (!filesGeraded.files || filesGeraded.files.length === 0) {
      console.log('Response:', response);
      console.log('TypeScript Codes:', filesGeraded);
      throw new Error('No code generated!');
    }

    for (const file of filesGeraded.files) {
      const fileName = file.filename;
      const code = file.code;
      if (!fileName) {
        console.log('Code:', code);
        console.log('File:', fileName);
        throw new Error('File name not found!');
      }
      await saveFile(fileName, code);
    }

    return response.usage;
  }

  /**
   * Creates multiple files based on the provided SQL and file configurations.
   * @param sql - The SQL content to be used.
   * @param fileConfigs - An array of file configurations.
   */
  public async createFiles(fileConfigs: FileConfig[]): Promise<void> {
    const generateFile = async (fileConfig: FileConfig) => {
      const { files } = fileConfig;
      try {
        const filteredFiles = await filterExistingFiles(files);
        if (filteredFiles.length === 0) {
          return;
        }
        filteredFiles.map((file) => log.info('Generating File:', file));
        fileConfig.files = filteredFiles;

        const usage = await this.createCode(fileConfig);
        this.totalUsage.prompt_tokens += usage.prompt_tokens;
        this.totalUsage.completion_tokens += usage.completion_tokens;
        this.totalUsage.total_tokens += usage.total_tokens;
        // log.info('Usage:', usage);
        filteredFiles.map((file) =>
          log.success('File generated successfully!:', file),
        );
      } catch (error) {
        log.error(`Error generating file(s): ${files}`);
        log.error(`Error message: ${(error as Error).message}`);
        throw error;
      }
    };

    try {
      // Execute operations sequentially
      for (const fileConfig of fileConfigs) {
        await generateFile(fileConfig);
      }

      let totalCost =
        (this.totalUsage.prompt_tokens / 1_000_000) * openAIPrices.input;
      totalCost +=
        (this.totalUsage.completion_tokens / 1_000_000) * openAIPrices.output;

      console.log('\r');
      log.info('Total Usage Input:', this.totalUsage.prompt_tokens.toString());
      log.info(
        'Total Usage Output:',
        this.totalUsage.completion_tokens.toString(),
      );
      log.info('Total Cost:', `US$ ${totalCost.toFixed(4)}`);
    } catch (error) {
      log.error(`Error generating files: ${(error as Error).message}`);
      throw error;
    }
  }
}
