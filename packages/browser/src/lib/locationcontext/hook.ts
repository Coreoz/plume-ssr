import { getGlobalInstance } from 'plume-ts-di';
import { useContext } from 'react';
import { To } from 'react-router-dom';
import {
  SsrLocationContext,
  SsrLocationContextHolder,
} from './SsrLocationContext';

export type UpdateLocationContextHook = {
  setContextRedirectUrl: (newUrl: string | To) => void,
};

/**
 * Updating the SsrLocationContext.
 * The update of the SsrLocationContext allows to manage the redirection on the SSR side.
 * @return setRedirectUrl function to update the redirect URL in the context
 */
export function useUpdateLocationContext(): UpdateLocationContextHook {
  const context = useContext<SsrLocationContext>(getGlobalInstance(SsrLocationContextHolder).getSsrLocationContext());
  return {
    setContextRedirectUrl: (newUrl: string | To) => {
      if (context) {
        context.redirectUrl = typeof newUrl === 'string'
          ? newUrl
          : `${newUrl.pathname}${newUrl.search ?? ''}${newUrl.hash ?? ''}`;
      }
    },
  };
}
