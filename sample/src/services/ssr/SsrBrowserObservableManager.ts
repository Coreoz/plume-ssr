import { observable, WritableObservable } from 'micro-observables';
import { SsrObservableManager } from '@plume-ssr/browser';

export type SsrObservableName = 'sample' | 'contentful-footer' | 'contentful-page';

export type SsrObservableKey = 'lang' | 'pageName';

export class SsrBrowserObservableManager extends SsrObservableManager {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  override observable<T>(_observableName: SsrObservableName): WritableObservable<T | undefined> {
    return observable(undefined);
  }
}
