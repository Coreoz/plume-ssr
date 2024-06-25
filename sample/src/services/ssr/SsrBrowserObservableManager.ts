import { observable } from 'micro-observables';
import { SsrObservableContent, SsrObservableManager, SsrWritableObservable } from 'plume-ssr-browser';

export type SsrObservableName = 'sample' | 'contentful-footer' | 'contentful-page';

export type SsrObservableKey = 'lang' | 'pageName';

declare global {
  interface Window {
    observableData: Record<string, SsrObservableContent<unknown, string>>;
  }
}

function initialObservableValue<T>(observableName: string): SsrObservableContent<T, string> | undefined {
  if (window && window.observableData && window.observableData[observableName]) {
    return window.observableData[observableName] as SsrObservableContent<T, string>;
  }
  return undefined;
}

export class SsrBrowserObservableManager extends SsrObservableManager<SsrObservableKey> {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  override observable<T>(_observableName: SsrObservableName): SsrWritableObservable<T, SsrObservableKey> {
    return new SsrWritableObservable(observable(initialObservableValue(_observableName)));
  }
}
