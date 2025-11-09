import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { APIUserAbortError } from 'openai';
import {
  MessageContentBlock,
  MessageContentType,
  TextContentBlock,
  ToolUseContentBlock,
  ToolResultContentBlock,
  ThinkingContentBlock,
  isUserActionContentBlock,
  isComputerToolUseContentBlock,
  isImageContentBlock,
} from '@bytebot/shared';
import { DEFAULT_MODEL } from './openrouter.constants';
import { Message, Role } from '@prisma/client';
import { openrouterTools } from './openrouter.tools';
import {
  BytebotAgentService,
  BytebotAgentInterrupt,
  BytebotAgentResponse,
} from '../agent/agent.types';

@Injectable()
export class OpenRouterService implements BytebotAgentService {
  private readonly openrouter: OpenAI;
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'OPENROUTER_API_KEY is not set. OpenRouterService will not work properly.',
      );
    }

    this.openrouter = new OpenAI({
      apiKey: apiKey || 'dummy-key-for-initialization',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://bytebot.ai',
        'X-Title': 'Bytebot AI Agent',
      },
    });
  }

  async generateMessage(
    systemPrompt: string,
    messages: Message[],
    model: string = DEFAULT_MODEL.name,
    useTools: boolean = true,
    signal?: AbortSignal,
  ): Promise<BytebotAgentResponse> {
    try {
      const maxTokens = 8192;

      // Convert our message content blocks to OpenRouter's expected format
      const openrouterMessages = this.formatMessagesForOpenRouter(messages);

      // Prepare the system message
      const systemMessage: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam = {
        role: 'system',
        content: systemPrompt,
      };

      // Make the API call
      const response = await this.openrouter.chat.completions.create(
        {
          model,
          max_tokens: maxTokens,
          messages: [systemMessage, ...openrouterMessages],
          tools: useTools ? openrouterTools : undefined,
          tool_choice: useTools ? 'auto' : undefined,
        },
        { signal },
      );

      // Convert OpenRouter's response to our message content blocks format
      return {
        contentBlocks: this.formatOpenRouterResponse(response),
        tokenUsage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      this.logger.log(error);

      if (error instanceof APIUserAbortError) {
        this.logger.log('OpenRouter API call aborted');
        throw new BytebotAgentInterrupt();
      }
      this.logger.error(
        `Error sending message to OpenRouter: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Convert our MessageContentBlock format to OpenRouter's message format
   */
  private formatMessagesForOpenRouter(
    messages: Message[],
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const openrouterMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Process each message content block
    for (const message of messages) {
      const messageContentBlocks = message.content as MessageContentBlock[];

      if (message.role === Role.USER) {
        // Handle user messages
        if (
          messageContentBlocks.every((block) => isUserActionContentBlock(block))
        ) {
          // User action blocks - convert to text descriptions
          const userActionTexts = messageContentBlocks.flatMap((block) =>
            block.content
              .filter((subBlock) => isComputerToolUseContentBlock(subBlock))
              .map((subBlock) => 
                `User performed action: ${subBlock.name}\n${JSON.stringify(subBlock.input, null, 2)}`
              )
          );
          
          if (userActionTexts.length > 0) {
            openrouterMessages.push({
              role: 'user',
              content: userActionTexts.join('\n\n'),
            });
          }
        } else {
          // Regular user message content
          const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
          
          for (const block of messageContentBlocks) {
            if (block.type === MessageContentType.Text) {
              content.push({
                type: 'text',
                text: (block as TextContentBlock).text,
              });
            } else if (isImageContentBlock(block)) {
              content.push({
                type: 'image_url',
                image_url: {
                  url: `data:${block.source.media_type};base64,${block.source.data}`,
                },
              });
            }
          }

          if (content.length > 0) {
            openrouterMessages.push({
              role: 'user',
              content: content,
            });
          }
        }
      } else if (message.role === Role.ASSISTANT) {
        // Handle assistant messages
        const content: string[] = [];
        const toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [];

        for (const block of messageContentBlocks) {
          if (block.type === MessageContentType.Text) {
            content.push((block as TextContentBlock).text);
          } else if (block.type === MessageContentType.ToolUse) {
            const toolUseBlock = block as ToolUseContentBlock;
            toolCalls.push({
              id: toolUseBlock.id,
              type: 'function',
              function: {
                name: toolUseBlock.name,
                arguments: JSON.stringify(toolUseBlock.input),
              },
            });
          } else if (block.type === MessageContentType.Thinking) {
            const thinkingBlock = block as ThinkingContentBlock;
            content.push(`[Thinking: ${thinkingBlock.thinking}]`);
          }
        }

        const assistantMessage: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam = {
          role: 'assistant',
          content: content.join('\n') || null,
        };

        if (toolCalls.length > 0) {
          assistantMessage.tool_calls = toolCalls;
        }

        openrouterMessages.push(assistantMessage);

        // Add tool results as separate messages
        for (const block of messageContentBlocks) {
          if (block.type === MessageContentType.ToolResult) {
            const toolResultBlock = block as ToolResultContentBlock;
            let resultContent = '';

            if (toolResultBlock.content) {
              for (const resultItem of toolResultBlock.content) {
                if (resultItem.type === MessageContentType.Text) {
                  resultContent += (resultItem as TextContentBlock).text + '\n';
                } else if (isImageContentBlock(resultItem)) {
                  resultContent += `[Image: ${resultItem.source.media_type}]\n`;
                }
              }
            }

            openrouterMessages.push({
              role: 'tool',
              tool_call_id: toolResultBlock.tool_use_id,
              content: resultContent.trim() || 'Tool executed successfully',
            });
          }
        }
      }
    }

    return openrouterMessages;
  }

  /**
   * Convert OpenRouter's response to our MessageContentBlock format
   */
  private formatOpenRouterResponse(
    response: OpenAI.Chat.Completions.ChatCompletion,
  ): MessageContentBlock[] {
    const contentBlocks: MessageContentBlock[] = [];

    const choice = response.choices[0];
    if (!choice?.message) {
      return contentBlocks;
    }

    const message = choice.message;

    // Add text content
    if (message.content) {
      contentBlocks.push({
        type: MessageContentType.Text,
        text: message.content,
      } as TextContentBlock);
    }

    // Add tool calls
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === 'function') {
          let parsedInput: any;
          try {
            parsedInput = JSON.parse(toolCall.function.arguments);
          } catch (error) {
            this.logger.warn(
              `Failed to parse tool arguments: ${toolCall.function.arguments}`,
            );
            parsedInput = { raw_arguments: toolCall.function.arguments };
          }

          contentBlocks.push({
            type: MessageContentType.ToolUse,
            id: toolCall.id,
            name: toolCall.function.name,
            input: parsedInput,
          } as ToolUseContentBlock);
        }
      }
    }

    return contentBlocks;
  }
}