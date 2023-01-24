import express from 'express';

/**
 * Handle the request to generate the HTML content of the page requested.
 *
 * The response must be written directly in the response object
 */
export interface SsrHtmlRenderer {
  (
    request: express.Request,
    response: express.Response,
    indexHtmlTemplate: string,
  ): Promise<unknown>;
}
