import { Observable, WritableObservable } from 'micro-observables';

/**
 * A configuration value: it should be a simple type, not a full object
 */
export type SsrConfigValue = string | number | boolean | undefined;

/**
 * The content SSR compatible stored in SSR compatible observable
 *
 * `T` The type of the observable data
 *
 * `K` The name of the observable, the type should be a string union type.
 * This helps avoid mistakes: the name of the observable will be constrained to be
 * in this union type that will also be used for the observable configuration in the SSR part.
 */
export type SsrObservableContent<T, K extends string> = {
  /**
   * The data really used by the observable
   */
  data: T,
  /**
   * The config contains all the parameters that had influence on how the data were computed.
   * For example, the config could be: `{lang: 'en', siteId: '1234', pageAlias: 'homepage'}`
   */
  config: Partial<Record<K, SsrConfigValue>>,
};

/**
 * A {@link WritableObservable} with its SSR configuration
 */
export class SsrWritableObservable<T, K extends string> {
  constructor(private readonly baseObservable: WritableObservable<SsrObservableContent<T, K> | undefined >) {
  }

  set(val: SsrObservableContent<T, K> | undefined | Observable<SsrObservableContent<T, K> | undefined>) {
    this.baseObservable.set(val);
  }

  update(updater:
  (val: SsrObservableContent<T, K> | undefined) =>
  SsrObservableContent<T, K> | undefined | Observable<SsrObservableContent<T, K> | undefined>,
  ) {
    this.baseObservable.update(updater);
  }

  readOnly(): Observable<SsrObservableContent<T, K> | undefined> {
    return this.baseObservable;
  }

  data(): Observable<T | undefined> {
    return this.baseObservable.select((content) => content?.data);
  }
}
