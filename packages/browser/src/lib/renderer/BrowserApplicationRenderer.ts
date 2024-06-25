import { hydrateRoot } from 'react-dom/client';
import * as ReactDOM from 'react-dom/client';

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
 */
export async function renderBrowserApplication(
  reactApp: JSX.Element,
  rootElementId: string = 'root',
) {
  const rootDomElement = document.getElementById(rootElementId);
  if (rootDomElement === null) {
    throw new Error(`HTML error: there is no element with id "${rootElementId}"`);
  }

  if (rootDomElement.children.length > 0) {
    hydrateRoot(rootDomElement, reactApp);
  } else {
    ReactDOM.createRoot(rootDomElement).render(reactApp);
  }
}
