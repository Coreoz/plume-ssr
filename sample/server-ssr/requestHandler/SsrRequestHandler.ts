import {
  CurrentHttpRequestContainer,
  RenderedApplication,
  renderSsrApplication,
  SsrHtmlRenderer,
} from 'plume-ssr-server';
import { SsrLocationContextHolder } from 'plume-ssr-browser';
import HttpPromiseMonitor from '../../src/api/HttpPromiseMonitor';
import createAppRenderer from '../renderer/AppRenderer';
import ServerSsrObservableManager from '../observable/ServerSsrObservableManager';

function ssrRequestHandler(
  currentHttpRequestContainer: CurrentHttpRequestContainer,
  ssrLocationContextHolder: SsrLocationContextHolder,
  observableManager: ServerSsrObservableManager,
  ...promiseMonitors: HttpPromiseMonitor[]
): SsrHtmlRenderer {
  return async (
    request, response, indexHtmlTemplate,
  ) => {
    const { appHtml, appData, redirectUrl } = await renderSsrApplication<RenderedApplication>(
      request,
      createAppRenderer(currentHttpRequestContainer, ssrLocationContextHolder, observableManager),
      promiseMonitors,
    );

    // logging to understand why observable may not work correctly
    // logger.debug('Observable query parameters', requestKeysExtractor(getGlobalInstance(LocaleResolver))(request));
    // getGlobalInstance(ServerSsrObservableManager).logData();

    if (redirectUrl) {
      // If react-router is redirecting...
      response.redirect(301, redirectUrl);
      return;
    }

    /*
     * => Ici customisation du template html avec mustache : https://github.com/janl/mustache.js <=
     */
    const htmlTemplateRendered = indexHtmlTemplate
      .replace('<!--app-html-->', appHtml)
      .replace('<!--app-data-->', appData);
    response
      .status(200)
      .set({ 'Content-Type': 'text/html' })
      .end(htmlTemplateRendered);
  };
}

export default ssrRequestHandler;
