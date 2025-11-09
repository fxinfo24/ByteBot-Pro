import { BytebotAgentModel } from '../agent/agent.types';

export const OPENROUTER_MODELS: BytebotAgentModel[] = [
  {
    provider: 'openrouter',
    name: 'anthropic/claude-3.5-sonnet',
    title: 'Claude 3.5 Sonnet (OpenRouter)',
    contextWindow: 200000,
  },
  {
    provider: 'openrouter',
    name: 'openai/gpt-4o',
    title: 'GPT-4o (OpenRouter)',
    contextWindow: 128000,
  },
  {
    provider: 'openrouter',
    name: 'google/gemini-pro-1.5',
    title: 'Gemini Pro 1.5 (OpenRouter)',
    contextWindow: 1000000,
  },
  {
    provider: 'openrouter',
    name: 'meta-llama/llama-3.1-405b-instruct',
    title: 'Llama 3.1 405B (OpenRouter)',
    contextWindow: 131072,
  },
  {
    provider: 'openrouter',
    name: 'anthropic/claude-3-opus',
    title: 'Claude 3 Opus (OpenRouter)',
    contextWindow: 200000,
  },
  {
    provider: 'openrouter',
    name: 'z-ai/glm-4.5-air:free',
    title: 'GLM-4.5-Air (Free)',
    contextWindow: 128000,
  },
  {
    provider: 'openrouter',
    name: 'tngtech/deepseek-r1t2-chimera:free',
    title: 'DeepSeek R1T2 Chimera (Free)',
    contextWindow: 32768,
  },
];

export const DEFAULT_MODEL = OPENROUTER_MODELS[0];