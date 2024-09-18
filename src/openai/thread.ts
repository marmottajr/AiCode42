// src/openai/thread.ts
import openai from '../openai/openaiConfig';
import { RetrieveMessage } from '../types/retrieveMessage';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const FilesResponse = z.object({
  filename: z.string(),
  code: z.string(),
});
const CodesFomart = z.object({
  files: z.array(FilesResponse),
});

/**
 * Class that handles threading and message operations with OpenAI's API.
 */
export class Thread {
  /**
   * Runs a thread with a specified assistant ID.
   * @param threadId - The ID of the thread.
   * @param assistantId - The assistant ID to use.
   * @returns The ID of the run.
   */
  async run(threadId: string, assistantId: string): Promise<string> {
    const run = await openai.beta.threads.runs.create(threadId, {
      response_format: zodResponseFormat(CodesFomart, 'files'),
      // response_format: ThreadsAPI'json_object',
      assistant_id: assistantId,
    });
    return run.id;
  }

  /**
   * Creates a new thread and returns its ID.
   * @returns The ID of the newly created thread.
   */
  async create(): Promise<string> {
    const emptyThread = await openai.beta.threads.create();
    return emptyThread.id;
  }

  /**
   * Retrieves a thread by its ID.
   * @param id - The ID of the thread to retrieve.
   * @returns The retrieved thread object.
   */
  async retrieve(id: string) {
    const thread = await openai.beta.threads.retrieve(id);
    return thread;
  }

  /**
   * Deletes a thread by its ID.
   * @param id - The ID of the thread to delete.
   * @returns The response from the delete operation.
   */
  async delete(id: string) {
    const response = await openai.beta.threads.del(id);
    return response;
  }

  /**
   * Adds a message to a thread.
   * @param threadId - The ID of the thread.
   * @param message - The message content to add.
   */
  async addMessage(threadId: string, message: string): Promise<void> {
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
  }

  /**
   * Retrieves a run by its ID.
   * @param threadId - The thread ID.
   * @param runId - The run ID.
   * @returns The retrieved run object.
   */
  async retrieveRun(threadId: string, runId: string) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    return run;
  }

  /**
   * Gets the status of a run.
   * @param threadId - The thread ID.
   * @param runId - The run ID.
   * @returns The status of the run.
   */
  async getRunStatus(threadId: string, runId: string): Promise<string> {
    const run = await this.retrieveRun(threadId, runId);
    return run.status;
  }

  /**
   * Lists the steps of a run and returns the ID of the completed step.
   * @param threadId - The thread ID.
   * @param runId - The run ID.
   * @returns The ID of the completed step, or an empty string if not completed.
   */
  async listRunSteps(threadId: string, runId: string): Promise<string> {
    const runSteps = await openai.beta.threads.runs.steps.list(threadId, runId);
    if (runSteps.data && runSteps.data[0]?.status === 'completed') {
      return runSteps.data[0].id;
    }
    return '';
  }

  /**
   * Retrieves the message ID from a run step.
   * @param threadId - The thread ID.
   * @param runId - The run ID.
   * @param stepId - The step ID.
   * @returns The message ID, or an empty string if not found.
   */
  async retrieveMessageId(
    threadId: string,
    runId: string,
    stepId: string,
  ): Promise<string> {
    const runStep = await openai.beta.threads.runs.steps.retrieve(
      threadId,
      runId,
      stepId,
    );
    const stepDetails = runStep.step_details;
    if (stepDetails.type === 'message_creation') {
      return stepDetails.message_creation.message_id;
    }
    return '';
  }

  /**
   * Retrieves a message from a thread by message ID.
   * @param threadId - The thread ID.
   * @param messageId - The message ID.
   * @returns The retrieved message content and usage statistics.
   */
  async retrieveMessage(
    threadId: string,
    messageId: string,
  ): Promise<RetrieveMessage> {
    const result: RetrieveMessage = {
      text: '',
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

    const retrievedMessage = await openai.beta.threads.messages.retrieve(
      threadId,
      messageId,
    );
    const messageContent = retrievedMessage.content;

    if (Array.isArray(messageContent) && messageContent.length > 0) {
      const textMessage = messageContent[0] as any;
      if (textMessage.text) {
        result.text = textMessage.text.value;
      }
    }

    const runs = await openai.beta.threads.runs.list(threadId);
    const data = runs.data;
    for (const run of data) {
      const usage = run.usage;
      result.usage = usage;
    }

    return result;
  }
}
