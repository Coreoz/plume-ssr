import { Context, createContext } from 'react';

/**
 * Location context used to track redirection during the SSRendering.
 *
 * @property {string} redirectUrl url of redirection, default value: empty string
 */
export interface SsrLocationContext {
  redirectUrl: string,
}

const INIT_CONTEXT: SsrLocationContext = { redirectUrl: '' };

/**
 * Store the SsrLocationContext during SSRendering.
 * Expose the context created by the project to the lib, more specifically to the {@link Redirect} component.
 * Exposing the SsrLocationContext allows the {@link Redirect} to update the context when a redirect is triggered.
 */
export class SsrLocationContextHolder {
  private ssrLocationContext: Context<SsrLocationContext>;

  constructor() {
    this.ssrLocationContext = createContext({ ...INIT_CONTEXT });
  }

  getSsrLocationContext() {
    return this.ssrLocationContext;
  }

  clearSsrLocationContext() {
    this.ssrLocationContext = createContext({ ...INIT_CONTEXT });
  }
}
