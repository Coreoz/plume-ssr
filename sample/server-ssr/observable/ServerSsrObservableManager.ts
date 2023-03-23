import express from 'express';
import { SsrWritableObservable } from 'plume-ssr-browser';
import { CurrentHttpRequestContainer, SsrObservableParameters, SsrServerObservableManager } from 'plume-ssr-server';
import { routeNameOrDefault } from '../../src/components/pages/Home';
import { LocaleResolver } from '../../src/lib/locale-resolver/LocaleResolver';
import {
  SsrBrowserObservableManager,
  SsrObservableKey,
  SsrObservableName,
} from '../../src/services/ssr/SsrBrowserObservableManager';

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

  constructor(
    currentHttpRequestContainer: CurrentHttpRequestContainer,
    localeResolver: LocaleResolver,
  ) {
    super();
    this.ssrObservableManager = new SsrServerObservableManager(
      requestKeysExtractor(localeResolver),
      currentHttpRequestContainer.getCurrentHttpRequest(),
      observables,
    );
  }

  override observable<T>(observableName: SsrObservableName): SsrWritableObservable<T, SsrObservableKey> {
    return this.ssrObservableManager.observable(observableName);
  }

  clearExpiredObservableData(currentTimestamp: number) {
    return this.ssrObservableManager.clearExpiredObservableData(currentTimestamp);
  }

  logData() {
    this.ssrObservableManager.logData();
  }
}
