import { ChatCompletionTool } from 'openai/resources';
import { agentTools } from '../agent/agent.tools';

/**
 * Converts an agent tool definition to OpenRouter Chat Completion tool format
 * OpenRouter uses the same format as OpenAI's Chat Completion API
 */
function agentToolToOpenRouterTool(agentTool: any): ChatCompletionTool {
  return {
    type: 'function',
    function: {
      name: agentTool.name,
      description: agentTool.description,
      parameters: agentTool.input_schema,
    },
  };
}

/**
 * All tools converted to OpenRouter Chat Completion format
 */
export const openrouterTools: ChatCompletionTool[] = agentTools.map((tool) =>
  agentToolToOpenRouterTool(tool),
);