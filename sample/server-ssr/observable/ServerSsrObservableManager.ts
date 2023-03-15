import { CurrentHttpRequestContainer, SsrObservableParameters, SsrServerObservableManager } from 'plume-ssr-server';
import express from 'express';
import { SsrWritableObservable } from 'plume-ssr-browser';
import { Scheduler } from 'simple-job-scheduler';
import { dayjs } from 'dayjs';
import {
  SsrBrowserObservableManager,
  SsrObservableKey,
  SsrObservableName,
} from '../../src/services/ssr/SsrBrowserObservableManager';
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

  constructor(
    currentHttpRequestContainer: CurrentHttpRequestContainer,
    localeResolver: LocaleResolver,
    scheduler: Scheduler,
  ) {
    super();
    this.ssrObservableManager = new SsrServerObservableManager(
      requestKeysExtractor(localeResolver),
      currentHttpRequestContainer.getCurrentHttpRequest(),
      observables,
    );
    scheduler.schedule(
      'clean observable cache',
      () => this.ssrObservableManager.clearExpiredObservableData(dayjs().millisecond()),
      // every minute
      60000,
    );
  }

  override observable<T>(observableName: SsrObservableName): SsrWritableObservable<T, SsrObservableKey> {
    return this.ssrObservableManager.observable(observableName);
  }

  logData() {
    this.ssrObservableManager.logData();
  }
}
