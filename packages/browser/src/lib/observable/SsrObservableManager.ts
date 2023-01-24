import { WritableObservable } from 'micro-observables';

export abstract class SsrObservableManager {
  abstract observable<T>(observableName: string): WritableObservable<T | undefined>;
}
