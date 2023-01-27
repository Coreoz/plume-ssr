import { SsrWritableObservable } from './SsrWritableObservable';

export abstract class SsrObservableManager<K extends string> {
  abstract observable<T>(observableName: string): SsrWritableObservable<T, K>;
}
