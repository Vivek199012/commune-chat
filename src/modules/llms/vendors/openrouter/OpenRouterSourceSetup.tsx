import * as React from 'react';

import { Button, Typography } from '@mui/joy';

import { FormInputKey } from '~/common/components/forms/FormInputKey';
import { InlineError } from '~/common/components/InlineError';
import { Link } from '~/common/components/Link';
import { SetupFormRefetchButton } from '~/common/components/forms/SetupFormRefetchButton';
import { getCallbackUrl } from '~/common/app.routes';

import { DModelSourceId } from '../../store-llms';
import { useLlmUpdateModels } from '../useLlmUpdateModels';
import { useSourceSetup } from '../useSourceSetup';

import { isValidOpenRouterKey, ModelVendorOpenRouter } from './openrouter.vendor';
import { FormSwitchControl } from '~/common/components/forms/FormSwitchControl';


export function OpenRouterSourceSetup(props: { sourceId: DModelSourceId }) {

  // external state
  const { source, sourceHasLLMs, access, updateSetup } =
    useSourceSetup(props.sourceId, ModelVendorOpenRouter);

  // derived state
  const { oaiKey, defaultCheck } = access;

  const needsUserKey = !ModelVendorOpenRouter.hasBackendCap?.();
  const keyValid = isValidOpenRouterKey(oaiKey);
  const keyError = (/*needsUserKey ||*/ !!oaiKey) && !keyValid;
  const shallFetchSucceed = oaiKey ? keyValid : !needsUserKey;

  // fetch models
  const { isFetching, refetch, isError, error } =
    useLlmUpdateModels(ModelVendorOpenRouter, access, !sourceHasLLMs && shallFetchSucceed, source, true);


  const handleOpenRouterLogin = () => {
    // replace the current page with the OAuth page
    const callbackUrl = getCallbackUrl('openrouter');
    const oauthUrl = 'https://openrouter.ai/auth?callback_url=' + encodeURIComponent(callbackUrl);
    window.open(oauthUrl, '_self');
    // ...bye / see you soon at the callback location...
  };


  return <>

    <Typography level='body-sm'>
      <Link href='https://openrouter.ai/keys' target='_blank'>OpenRouter</Link> is an independent service
      granting access to <Link href='https://openrouter.ai/docs#models' target='_blank'>exclusive models</Link> such
      as GPT-4 32k, Claude, and more. <Link
        href='https://github.com/smart-window/com-chat/blob/main/docs/config-openrouter.md' target='_blank'>
        Configuration &amp; documentation</Link>.
    </Typography>

    <SetupFormRefetchButton
      refetch={refetch} disabled={!shallFetchSucceed || isFetching} loading={isFetching} error={isError}
      leftButton={
        <Button
          color='neutral' variant={(needsUserKey && !keyValid) ? 'solid' : 'outlined'}
          onClick={handleOpenRouterLogin}
          endDecorator={(needsUserKey && !keyValid) ? '🎁' : undefined}
        >
          OpenRouter Login
        </Button>
      }
    />

    {isError && <InlineError error={error} />}

  </>;
}
