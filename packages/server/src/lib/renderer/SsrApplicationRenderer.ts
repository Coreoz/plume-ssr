import express from 'express';
import { extractMonitorContextData } from 'plume-ssr-browser';
import { PromiseMonitor } from 'simple-http-rest-client';
import { Logger } from 'simple-logging-system';

/**
 * Render the application to an HTML string.
 * If the application router triggers a redirection, the url will be returned.
 *
 * @param {express.request} request Express http request
 * @returns RenderedApplication - Object containing the application rendered as string, and the redirection url.
 */
export interface ApplicationHtmlRenderer<T extends RenderedApplication> {
  (request: express.Request): T;
}

/**
 * Object containing the application once rendered by the SSR server using an {@link ApplicationHtmlRenderer}.
 *
 * @property {string} appHtml Application rendered as an HTML string
 * @property {string} redirectUrl New Url, If the application router triggers a redirection
 */
export interface RenderedApplication {
  appHtml: string;
  redirectUrl: string;
}

/**
 * Options passed to the renderSsrApplication function
 * to configure the SSR renderer.
 *
 * @property {number} maxRender Maximum number of renderings to perform
 * before returning the application as an HTML string, even if the promises are still not resolved.
 */
export interface SsrRenderOption {
  maxRender: number,
}

const logger = new Logger('renderSsrApplication');

/**
 * Perform an SSR of the application.
 *
 * The application will be rendered several times until all data returned by Promises are resolved.
 * The data loading promises are being monitored using the promiseMonitors array passed as parameter.
 * Between each rendering, renderSsrApplication will wait for all promises to be resolved.
 *
 * To avoid infinite rendering loops,
 * a maximum number of renderings is configured using the option parameter.
 *
 * @param request Express current http request
 * @param ssrHtmlRenderer {@link ApplicationHtmlRenderer} that will be used to render the application
 * @param promiseMonitors Array of promise monitors that maintains a state of all the application promises
 * that are being executed and that have an impact on the rendering of the application
 * @param [option={maxRender:10}] - used to configure the SSR rendering
 */
export async function renderSsrApplication<T extends RenderedApplication>(
  request: express.Request,
  ssrHtmlRenderer: ApplicationHtmlRenderer<T>,
  promiseMonitors: PromiseMonitor[] = [],
  option: SsrRenderOption = {
    maxRender: 10,
  },
) {
  let renderedApplication = ssrHtmlRenderer(request);
  const { maxRender } = option;

  for (let i = 0; i < maxRender; i += 1) {
    if (renderedApplication.redirectUrl) {
      return renderedApplication;
    }
    if (promiseMonitors.some((promiseMonitor) => promiseMonitor.getRunningPromisesCount() > 0)) {
      logger.info('There are Promises whose resolution is necessary to the SSR, waiting for their resolution...',
        {
          requestUrl: request.originalUrl,
          promiseMonitors: extractMonitorContextData(promiseMonitors),
        },
      );

      // eslint-disable-next-line no-await-in-loop
      await Promise.allSettled(promiseMonitors.flatMap((promiseMonitor) => promiseMonitor.getRunningPromises()));

      logger.info('Re-render the React application now that the Promises have been resolved');
      renderedApplication = ssrHtmlRenderer(request);
    } else {
      return renderedApplication;
    }
  }
  logger.error(`There are still unresolved promises after ${maxRender} iterations... \
  returning the current version of HTML`);
  /*
   * If the application could not be correctly loaded on the SSR side, do not return it,
   * otherwise it is in an unstable state and the hydration may fail
   */
  return Promise.resolve({ appHtml: '' } as T);
}
