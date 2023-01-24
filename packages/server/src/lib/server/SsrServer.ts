import { Express } from 'express';
import { SsrHtmlRenderer } from '../renderer/SsrHtmlRenderer';

/**
 * Manages the creation of the Express server and with Vite if we are in dev
 */
export abstract class SsrServer {
  abstract createExpressServer(
    ssrHtmlRenderer: SsrHtmlRenderer
  ): Promise<Express>;
}
