import { hydrateRoot } from 'react-dom/client';
import * as ReactDOM from 'react-dom/client';
import { PromiseMonitor } from 'simple-http-rest-client';
import { Logger } from 'simple-logging-system';

/**
 * Options passed to the renderApplication function to configure the application hydration.
 *
 * Warning: The options used should be exactly the same used to render the SsrApplication,
 * otherwise the hydration may fail.
 *
 * @property {number} maxRender Maximum number of renderings to perform
 * before replacing the Html retrieved from the SSR Server with the application
 * if the promises are still not resolved.
 */
export interface BrowserRenderOption {
  maxRender: number,
}

const logger = new Logger('RenderBrowserApplication');

/**
 * Render the application by hydrating the html received from the SSR Server.
 *
 * The application will be rendered several times until all data returned by Promises is resolved.
 * The data loading promises are being monitored using the promiseMonitors array passed as parameter.
 * Between each rendering, renderBrowserApplication will wait for all promises to be resolved.
 *
 * To avoid infinite rendering loops,
 * a maximum number of renderings is configured using the option parameter.
 *
 * To avoid any miss match between the retrieved Html fom the SSR Server and the browser rendered application,
 * if there is still some data promises unresolved after the maximum number of render is reached,
 * the application will be rendered and mounted in the rootDomElement, instead of hydrating it.
 *
 * @param reactApp React application to render
 * @param rootElementId Id of the HTML element in which the application will be mounted.
 * @param promiseMonitors Array of promise monitors that maintains a state of all the application promises
 * that are being executed and that have an impact on the rendering of the application
 * @param [option={maxRender:10}] - used to configure the application rendering
 */
export async function renderBrowserApplication(
  reactApp: JSX.Element,
  rootElementId: string = 'root',
  promiseMonitors: PromiseMonitor[] = [],
  option: BrowserRenderOption = {
    maxRender: 10,
  },
) {
  const currentMillis = Date.now();
  const rootDomElement = document.getElementById(rootElementId);
  if (rootDomElement === null) {
    throw new Error(`HTML error: there is no element with id "${rootElementId}"`);
  }

  if (rootDomElement.children.length > 0) {
    // Essaie de re-render l'application tant qu'il y a des Promise en attente
    const dummyDiv = document.createElement('div');
    const dummyRoot = ReactDOM.createRoot(dummyDiv);

    try {
      await prepareApplicationForHydration(() => dummyRoot.render(reactApp), promiseMonitors, option);
      logger.info('All pending promises has been resolved, hydrating the received Html with the app...');
      dummyRoot.unmount();

      hydrateRoot(rootDomElement, reactApp);
      logger.info(`DOM hydrated in ${Date.now() - currentMillis}ms`);
      return;
    } catch {
      logger.error('DOM hydration failed, rendering app instead');
    }
  }

  ReactDOM.createRoot(rootDomElement).render(reactApp);
  logger.info(`DOM rendered in ${Date.now() - currentMillis}ms`);
}

/**
 * Extract context data from an array promiseMonitors.
 * It is useful especially for logging reasons.
 * @param promiseMonitors The promise monitors array
 */
export const extractMonitorContextData = (promiseMonitors: PromiseMonitor[]) => promiseMonitors
  .flatMap((promiseMonitor) => promiseMonitor
    .getRunningPromisesWithInfo()
    .map((runningPromise) => runningPromise[1].promiseInfo),
  );

/**
 * Render the application in a dummy Html element until all the data promises are resolved,
 *
 * @param renderApp
 * @param promiseMonitors
 * @param hydrationOption
 * @returns Promise resolved if all promises have been resolved,
 * Promise rejected if some promises are still pending after the maximum number of returns is reached.
 */
async function prepareApplicationForHydration(
  renderApp: () => void,
  promiseMonitors: PromiseMonitor[],
  hydrationOption: BrowserRenderOption,
) {
  const { maxRender } = hydrationOption;

  for (let i = 0; i < maxRender; i += 1) {
    renderApp();

    if (promiseMonitors.some((promiseMonitor) => promiseMonitor.getRunningPromisesCount() === 0)) {
      return Promise.resolve();
    }

    logger.info('There are Promises whose resolution is necessary to the hydration, waiting for their resolution...', {
      promiseMonitors: extractMonitorContextData(promiseMonitors),
    });

    // eslint-disable-next-line no-await-in-loop
    await Promise.allSettled(promiseMonitors.flatMap((promiseMonitor) => promiseMonitor.getRunningPromises()));

    logger.info('Re-render the React application now that the Promises have been resolved');
  }

  logger.warn(`There are still unresolved promises after ${maxRender} iterations`, {
    promiseMonitors: promiseMonitors.map((promiseMonitor) => promiseMonitor.getRunningPromisesWithInfo()),
  });
  return Promise.reject();
}
