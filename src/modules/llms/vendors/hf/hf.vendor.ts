import { backendCaps } from '~/modules/backend/state-backend';

import { OpenRouterIcon } from '~/common/components/icons/OpenRouterIcon';
import { HfIcon } from '~/common/components/icons/HfIcon';

import type { IModelVendor } from '../IModelVendor';
import type { OpenAIAccessSchema } from '../../transports/server/openai/openai.router';
import type { VChatFunctionIn, VChatMessageIn, VChatMessageOrFunctionCallOut, VChatMessageOut } from '../../transports/chatGenerate';

import { LLMOptionsOpenAI, openAICallChatGenerate } from '../openai/openai.vendor';
import { OpenAILLMOptions } from '../openai/OpenAILLMOptions';

import { HfSourceSetup } from './HfSourceSetup';


// special symbols
export const isValidHFKey = (apiKey?: string) => !!apiKey && apiKey.startsWith('hf_') && apiKey.length > 30;

// use OpenAI-compatible host and key
export interface SourceSetupOpenRouter {
  oaiKey: string;
  oaiHost: string;
}

/**
 * NOTE: the support is just started and incomplete - in particular it depends on some code that
 * hasn't been merged yet.
 *
 * Completion:
 *  [x] raise instanceLimit from 0 to 1 to continue development
 *  [x] add support to the OpenAI Router and Streaming function to add the headers required by OpenRouter (done in the access function)
 *  [~] merge the server-side models remapping from Azure OpenAI - not needed, using client-side remapping for now
 *  [x] decide whether to do UI work to improve the appearance - prioritized models
 *  [x] works!
 */
export const ModelVendorHf: IModelVendor<SourceSetupOpenRouter, OpenAIAccessSchema, LLMOptionsOpenAI> = {
  id: 'hf',
  name: 'Hugging Face',
  rank: 10,
  location: 'cloud',
  instanceLimit: 1,
  // hasFreeModels: true,
  hasBackendCap: () => backendCaps().hasLlmOpenRouter,

  // components
  Icon: HfIcon,
  SourceSetupComponent: HfSourceSetup,
  LLMOptionsComponent: OpenAILLMOptions,

  // functions
  initializeSetup: (): SourceSetupOpenRouter => ({
    oaiHost: 'https://huggingface.co/api',
    oaiKey: '',
  }),
  getTransportAccess: (partialSetup): OpenAIAccessSchema => ({
    dialect: 'hf',
    oaiKey: partialSetup?.oaiKey || '',
    oaiOrg: '',
    oaiHost: partialSetup?.oaiHost || '',
    heliKey: '',
    moderationCheck: false,
    defaultCheck: false,
  }),
  callChatGenerate(llm, messages: VChatMessageIn[], maxTokens?: number): Promise<VChatMessageOut> {
    return openAICallChatGenerate(this.getTransportAccess(llm._source.setup), llm.options, messages, null, null, maxTokens);
  },
  callChatGenerateWF(llm, messages: VChatMessageIn[], functions: VChatFunctionIn[] | null, forceFunctionName: string | null, maxTokens?: number): Promise<VChatMessageOrFunctionCallOut> {
    return openAICallChatGenerate(this.getTransportAccess(llm._source.setup), llm.options, messages, functions, forceFunctionName, maxTokens);
  },
};