import { getGlobalInstance } from 'plume-ts-di';
import { useContext } from 'react';
import { To } from 'react-router-dom';
import {
  SsrLocationContext,
  SsrLocationContextHolder,
} from './SsrLocationContext';

/**
 * Updating the SsrLocationContext.
 * The update of the SsrLocationContext allows to manage the redirection on the SSR side.
 * @param newUrl Redirect url
 */
export function useUpdateLocationContext(newUrl: string | To) {
  const context = useContext<SsrLocationContext>(getGlobalInstance(SsrLocationContextHolder).getSsrLocationContext());
  if (context) {
    context.redirectUrl = typeof newUrl === 'string'
      ? newUrl
      : `${newUrl.pathname}${newUrl.search ?? ''}${newUrl.hash ?? ''}`;
  }
}
