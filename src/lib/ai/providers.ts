/**
 * AI provider registry. Every provider is optional: it is "enabled" when its
 * key secret exists. Default models are a starting point — override per call
 * (`model`) or per project by editing `model` below. Check each vendor's docs
 * for current model ids.
 */
export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'xai' | 'deepseek';

export interface ProviderDef {
  id: ProviderId;
  label: string;
  keyName: 'OPENAI_API_KEY' | 'ANTHROPIC_API_KEY' | 'GEMINI_API_KEY' | 'XAI_API_KEY' | 'DEEPSEEK_API_KEY';
  /** `openai` = OpenAI-compatible /chat/completions. */
  api: 'openai' | 'anthropic' | 'gemini';
  baseUrl: string;
  model: string;
  keyUrl: string;
}

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    keyName: 'OPENAI_API_KEY',
    api: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    keyName: 'ANTHROPIC_API_KEY',
    api: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-sonnet-5-5',
    keyUrl: 'https://console.anthropic.com/settings/keys',
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    keyName: 'GEMINI_API_KEY',
    api: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-flash',
    keyUrl: 'https://aistudio.google.com/apikey',
  },
  xai: {
    id: 'xai',
    label: 'xAI Grok',
    keyName: 'XAI_API_KEY',
    api: 'openai',
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-4',
    keyUrl: 'https://console.x.ai',
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    keyName: 'DEEPSEEK_API_KEY',
    api: 'openai',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
};
