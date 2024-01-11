import { Observable } from 'micro-observables';
import { SsrObservableContent } from './SsrWritableObservable';
import { useObservable } from './useObservable';

/**
 * Convert loadable content to its original object
 * @param loadableContentObservable the loadable content observable
 */
export function useUndefinableSsrData<T, K extends string>(
  loadableContentObservable: Observable<SsrObservableContent<T | undefined, K> | undefined>,
): T | undefined {
  return useObservable(
    loadableContentObservable.select((
      loadableContent: SsrObservableContent<T | undefined, K> | undefined,
    ) => loadableContent?.data),
  );
}

export function useSsrData<T, K extends string>(
  loadableContentObservable: Observable<SsrObservableContent<T, K> | undefined>,
): T {
  return useUndefinableSsrData(loadableContentObservable) as T;
}
