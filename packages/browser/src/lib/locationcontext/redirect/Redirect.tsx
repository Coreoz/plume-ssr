import { redirect as reactRouterRedirect } from 'react-router-dom';
import { useUpdateLocationContext } from '../hook';

/**
 * Replace the function {@link redirect} from React router v6.
 * https://reactrouter.com/en/main/fetch/redirect
 *
 * Allow to redirect to a specific page of the application meanwhile updating the SsrLocationContext.
 * The update of the SsrLocationContext allows to manage the redirection on the SSR side.
 */
export function redirect(url: string, init?: number | ResponseInit) {
  const { setContextRedirectUrl } = useUpdateLocationContext();
  setContextRedirectUrl(url);
  return reactRouterRedirect(url, init);
}
