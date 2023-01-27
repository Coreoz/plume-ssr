import { SsrConfigValue, SsrObservableContent, SsrWritableObservable } from 'plume-ssr-browser';
import { Observable } from 'micro-observables';
import {
  CatchablePromise,
  DataLoader,
  useObservableLoader,
} from '../plume-http-react-hook-loader/observableLoaderHook';
import { areRecordsEqual } from './areRecordsEqual';

/**
 * Describe an {@link SsrWritableObservable} data and the function to trigger the loading of this data.
 *
 * The {@link SsrWritableObservable} data represents a data that must be loaded for a component
 * to be displayed correctly.
 */
export type SsrObservableDataHandler<T, K extends string> = {
  /**
   * The {@link SsrWritableObservable} data for which the loading process will be monitored
   */
  dataObservable: Observable<SsrObservableContent<T, K> | undefined>,
  /**
   * The predicate that indicates if the current {@link SsrWritableObservable} data represents a loaded state or not
   */
  isLoadedPredicate?: (data: T | undefined) => boolean,
  /**
   * The function that tries to load the {@link SsrWritableObservable} data.
   * This function must return some kind of `Promise`, `HttpPromise`,
   * or anything that provides an object containing `catch()` method with an error of type {@link HttpError}.
   *
   * This function will try to load only {@link SsrWritableObservable} data that are not yet loaded.
   */
  loader: () => CatchablePromise,
};

/**
 * TODO refactor this to accept only one SsrObservableDataHandler.
 * TODO Then the component WithDataLoader will accept an array of loader
 *
 * Hook that handles {@link SsrWritableObservable} data loading. It takes {@link ObservableDataHandler} parameters
 * for all {@link SsrWritableObservable} data that will need to be loading and monitored.
 *
 * This returns then a {@link DataLoader} that enables to easily monitor the loading status
 * of the {@link SsrWritableObservable} data.
 */
export function useSsrObservableLoader<
  K extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  H extends SsrObservableDataHandler<any, K>[],
>(
  observableSources: H,
  dependencies: Partial<Record<K, SsrConfigValue>>,
) : DataLoader<unknown[]> {
  return useObservableLoader(
    observableSources.map((observableSource) => ({
      dataObservable: observableSource.dataObservable,
      isLoadedPredicate: (observableContent) => (
        observableSource.isLoadedPredicate
          ? observableSource.isLoadedPredicate(observableContent?.data)
          : Boolean(observableContent)
      ) && Boolean(observableContent?.config)
        && areRecordsEqual(observableContent.config, dependencies),
      loader: observableSource.loader,
    })),
    Object.values(dependencies),
  );
}
