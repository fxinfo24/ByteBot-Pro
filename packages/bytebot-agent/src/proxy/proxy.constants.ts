export const PROXY_MODELS = [
  {
    provider: 'proxy',
    name: 'claude-3.5-sonnet',
    title: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
  },
  {
    provider: 'proxy',
    name: 'claude-3-opus',
    title: 'Claude 3 Opus',
    contextWindow: 200000,
  },
  {
    provider: 'proxy',
    name: 'claude-3-haiku',
    title: 'Claude 3 Haiku',
    contextWindow: 200000,
  },
  {
    provider: 'proxy',
    name: 'gpt-4o',
    title: 'GPT-4o',
    contextWindow: 128000,
  },
  {
    provider: 'proxy',
    name: 'gpt-4-turbo',
    title: 'GPT-4 Turbo',
    contextWindow: 128000,
  },
  {
    provider: 'proxy',
    name: 'gpt-4',
    title: 'GPT-4',
    contextWindow: 8000,
  },
  {
    provider: 'proxy',
    name: 'gpt-3.5-turbo',
    title: 'GPT-3.5 Turbo',
    contextWindow: 4000,
  },
  // FREE Models via OpenRouter
  {
    provider: 'proxy',
    name: 'z-ai/glm-4.5-air:free',
    title: 'GLM-4.5-Air (FREE)',
    contextWindow: 128000,
  },
  {
    provider: 'proxy',
    name: 'deepseek/deepseek-chat-v3.1:free',
    title: 'DeepSeek Chat v3.1 (FREE)',
    contextWindow: 64000,
  },
  {
    provider: 'proxy',
    name: 'qwen/qwen3-coder:free',
    title: 'Qwen 3 Coder (FREE)',
    contextWindow: 32000,
  },
];

export const DEFAULT_MODEL = PROXY_MODELS[0];