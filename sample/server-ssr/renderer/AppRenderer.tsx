import React from 'react';
import express from 'express';
import {
  ApplicationHtmlRenderer,
  RenderedApplication,
  CurrentHttpRequestContainer,
} from 'plume-ssr-server';
import { SsrLocationContext, SsrLocationContextHolder } from 'plume-ssr-browser';
import ReactDOMServer from 'react-dom/server';
import { createMemoryRouter } from 'react-router-dom';
import App from '../../src/components/App';
import ServerSsrObservableManager from '../observable/ServerSsrObservableManager';

function createAppRenderer(
  currentHttpRequest: CurrentHttpRequestContainer,
  ssrLocationContextHolder: SsrLocationContextHolder,
  observableManager: ServerSsrObservableManager,
): ApplicationHtmlRenderer<RenderedApplication> {
  return (request: express.Request) => {
    // initialize the data related to the http request
    currentHttpRequest.registerCurrentHttpRequest(request);

    // initialize the ssrLocationContext to track router redirects
    const context: SsrLocationContext = { redirectUrl: '' };
    ssrLocationContextHolder.clearSsrLocationContext();
    const ssrLocationContext = ssrLocationContextHolder.getSsrLocationContext();

    const appHtml = ReactDOMServer.renderToString(
      <ssrLocationContext.Provider value={context}>
        <App createRouter={(routes) => createMemoryRouter(routes, {
          initialEntries: [request.originalUrl],
          initialIndex: 0,
        })} />
      </ssrLocationContext.Provider>,
    );
    const appData = `window.observableData = ${JSON.stringify(observableManager.dumpData())}`;

    return { appData, appHtml, redirectUrl: context.redirectUrl ?? '' };
  };
}

export default createAppRenderer;
