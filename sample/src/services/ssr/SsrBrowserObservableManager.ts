import { observable } from 'micro-observables';
import { SsrObservableManager, SsrWritableObservable } from 'plume-ssr-browser';

export type SsrObservableName = 'sample' | 'contentful-footer' | 'contentful-page';

export type SsrObservableKey = 'lang' | 'pageName';

export class SsrBrowserObservableManager extends SsrObservableManager<SsrObservableKey> {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  override observable<T>(_observableName: SsrObservableName): SsrWritableObservable<T, SsrObservableKey> {
    return new SsrWritableObservable(observable(undefined));
  }
}
