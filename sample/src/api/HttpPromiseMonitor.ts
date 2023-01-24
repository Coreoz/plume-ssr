import { HttpFetchClient, PromiseMonitor } from 'simple-http-rest-client';

/**
 * Monitore les `Promise` des appels HTTP qui doivent être résolus pour le SSR et dont les données
 * doivent être référencées dans les moteurs de recherche.
 * Donc par exemple, les appels de récupération des données CMS doivent être affichés dans Google,
 * donc ils doivent être monitoré avec le {@link PromiseMonitor}.
 *
 * Voir {@link PromiseMonitor} et {@link ssrRequestHandler}
 * TODO Aurélien, à remplacer par l'implémentation de la lib simple http rest client
 */
export default class HttpPromiseMonitor extends PromiseMonitor {
  makeMonitor(httpClient: HttpFetchClient, promiseInfo?: object): HttpFetchClient {
    return (httpRequest) => this.monitor(
      httpClient(httpRequest),
      promiseInfo,
    );
  }
}
