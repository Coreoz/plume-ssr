import { WritableObservable } from 'micro-observables';
import { CurrentHttpRequestContainer, SsrObservableParameters, SsrServerObservableManager } from '@plume-ssr/server';
import express from 'express';
import { SsrBrowserObservableManager, SsrObservableKey } from '../../src/services/ssr/SsrBrowserObservableManager';
import { LocaleResolver } from '../../src/lib/locale-resolver/LocaleResolver';
import { routeNameOrDefault } from '../../src/components/pages/Home';

export const requestKeysExtractor = (localeResolver: LocaleResolver) => (request: express.Request) => ({
  lang: localeResolver.resolve().code,
  // TODO c'est très moche, à ne pas faire en vrai
  pageName: routeNameOrDefault(request.params[0].substring(1)),
});

const observables: SsrObservableParameters<SsrObservableKey>[] = [
  {
    name: 'sample',
    dependencyKeys: ['pageName'],
  },
];

export default class ServerSsrObservableManager extends SsrBrowserObservableManager {
  private readonly ssrObservableManager: SsrServerObservableManager<SsrObservableKey>;

  constructor(currentHttpRequestContainer: CurrentHttpRequestContainer, localeResolver: LocaleResolver) {
    super();
    this.ssrObservableManager = new SsrServerObservableManager(
      requestKeysExtractor(localeResolver),
      currentHttpRequestContainer.getCurrentHttpRequest(),
      observables,
    );
  }

  override observable<T>(observableName: string): WritableObservable<T | undefined> {
    return this.ssrObservableManager.observable(observableName);
  }

  logData() {
    this.ssrObservableManager.logData();
  }
}
