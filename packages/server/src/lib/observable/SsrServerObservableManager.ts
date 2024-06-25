import { Observable, observable } from 'micro-observables';
import express from 'express';
import { Logger } from 'simple-logging-system';
import {
  SsrConfigValue, SsrObservableContent, SsrObservableManager, SsrWritableObservable,
} from 'plume-ssr-browser';

const DEFAULT_CACHE_OPTIONS = {
  expireAfterWriteInMillis: undefined,
};

/**
 * Describes the cache option to apply to an observable data.
 * @property expireAfterWriteInMillis - Time in milliseconds after which the cached data will be emptied.
 */
export type SsrObservableCacheOptions = {
  expireAfterWriteInMillis?: number,
};

/**
 * Describes an observable parameter, for instance:
 * - {name: 'configuration', dependencyKeys: ['siteId'], cacheOptions: {expireAfterWriteInMillis: 3000}}
 * - {name: 'cms-page', dependencyKeys: ['siteId', 'lang', 'pageAlias']}
 */
export type SsrObservableParameters<K extends string> = {
  name: string,
  dependencyKeys: K[],
  cacheOptions?: SsrObservableCacheOptions
  // TODO add options here: cache duration, max entries, etc. + clean up task
};

/**
 * An observable data with its metadata.
 * The fetch timestamp will be used to optionally empty the data when they are expired.
 *
 * See {@link SsrObservableCacheOptions} for details
 */
type SsrObservableDataValue = {
  data: SsrObservableContent<unknown, string>,
  lastFetchTimestamp: number
};

/**
 * Describes the internal structure of the observable data
 */
type SsrObservableData<K extends string> = {
  observable: SsrWritableObservable<unknown, string>,
  dependencyKeys: Set<K>,
  currentConfig?: Record<string, SsrConfigValue>,
  latestDataByConfig: Map<string, SsrObservableDataValue>,
  cacheOptions: SsrObservableCacheOptions
};

const logger = new Logger('SsrServerObservable');

/**
 * Create a Map composite key that is comparable no matter the object properties order
 *
 * So for example, `makeConfigKey({a: 1, b: 2}))`
 * will be equals to `makeConfigKey({b: 2, a: 1}))`
 */
export const makeConfigKey = (config: Record<string, unknown>) =>
  // In JS, Map cannot use a composite key, to it has to be stringified
  // eslint-disable-next-line implicit-arrow-linebreak
  JSON.stringify(
    config,
    Object.keys(config)
      // Make sure that even if the keys are in the wrong order, it matches the same key
      .sort(),
  );

const filterConfig = <K extends string>(
  config: Record<K, SsrConfigValue>, dependencyKeys: Set<K>,
): Record<K, SsrConfigValue> => Object.keys(config)
    .filter((key) => dependencyKeys.has(key as K))
    .reduce((filteredConfig: Record<K, SsrConfigValue>, key) => {
    // eslint-disable-next-line no-param-reassign
      filteredConfig[key as K] = config[key as K];
      return filteredConfig;
    }, {} as Record<K, SsrConfigValue>);

export const areRecordsEqual = (record1: Record<string, unknown>, record2: Record<string, unknown>) => {
  const keys1 = Object.keys(record1);
  const keys2 = Object.keys(record2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (record1[key] !== record2[key]) {
      return false;
    }
  }

  return true;
};

export const isRecordPartial = (partialRecord: Record<string, unknown>, fullRecord: Record<string, unknown>) => {
  const partialKeys = Object.keys(partialRecord);

  for (const key of partialKeys) {
    if (partialRecord[key] !== fullRecord[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Implements `SsrObservable` in a way observables will be updated each time
 * the current `express.Request` is updated.
 *
 * This enables to cache data for SSR while making sure there will be not
 * data conflict when multiple incoming requests are handled "at the same time"
 */
export class SsrServerObservableManager<K extends string> extends SsrObservableManager<K> {
  private data: Map<string, SsrObservableData<K>>;

  private currentConfig: Record<string, SsrConfigValue>;

  /**
   * Creates a new `SsrServerObservableManager`
   * @param requestConfigKeyExtractor Takes a `express.Request` and extract the corresponding configuration.
   * It might for instance returns `{lang: 'en', siteId: '1234', pageAlias: 'homepage'}`
   * @param currentHttpRequestObservable The observable that must be updated each time
   * some information will be rendered Server side.
   * @param observableParameters The parameters of each observable in the application
   */
  constructor(
    requestConfigKeyExtractor: (request: express.Request) => Record<string, SsrConfigValue>,
    currentHttpRequestObservable: Observable<express.Request | undefined>,
    observableParameters: SsrObservableParameters<K>[],
  ) {
    super();
    this.currentConfig = {} as Record<string, SsrConfigValue>;
    this.data = new Map(observableParameters
      .map(SsrServerObservableManager.createObservableData)
      .map(([observableName, observableData]) => {
        observableData.observable.readOnly().subscribe((newData) => {
          if (!newData) {
            return;
          }
          if (!Object.keys(newData.config).every((entry) => observableData.dependencyKeys.has(entry as K))) {
            logger.error(
              `Trying to set the config ${newData.config} to observable ${observableName}`
              + ` Whereas the dependencies set to the observable are only ${observableData.dependencyKeys}.`
              + ' This will surely lead to content error.',
            );
          }
          // Replace the latest data value for the current config
          observableData.latestDataByConfig.set(
            makeConfigKey(newData.config),
            { data: newData, lastFetchTimestamp: Date.now() },
          );
          // Received data are actually from another config...
          // So the current observable must be updated to undefined to match the current config
          if (!isRecordPartial(newData.config, this.currentConfig)) {
            logger.info(
              'Observable config does not match current config (data received after the config changed?)',
              { observableConfig: newData.config, currentConfig: this.currentConfig },
            );
            observableData.observable.set(
              observableData.latestDataByConfig.get(
                makeConfigKey(filterConfig(this.currentConfig, observableData.dependencyKeys)),
              )?.data,
            );
          }
        });
        return [observableName, observableData];
      }),
    );

    currentHttpRequestObservable.subscribe((request) => {
      if (request) {
        this.changeCurrentConfig(requestConfigKeyExtractor(request));
      }
    });
  }

  override observable<T>(
    observableName: string,
  ): SsrWritableObservable<T, K> {
    let dataObservable = this.data.get(observableName)?.observable;
    if (!dataObservable) {
      logger.error(
        `No SSR configuration has been made for observable ${observableName} whereas it should be mandatory.`
        + ' Returning a fresh observable that will not change for each request... '
        + 'This will likely lead to content error.',
      );
      dataObservable = new SsrWritableObservable<T, K>(observable(undefined));
    }
    return dataObservable as SsrWritableObservable<T, K>;
  }

  private static createObservableData<K extends string>(
    ssrConfiguration: SsrObservableParameters<K>,
  ): [string, SsrObservableData<K>] {
    return [
      ssrConfiguration.name,
      {
        observable: new SsrWritableObservable<unknown, string>(observable(undefined)),
        dependencyKeys: new Set(ssrConfiguration.dependencyKeys),
        currentConfig: undefined,
        latestDataByConfig: new Map(),
        cacheOptions: { ...DEFAULT_CACHE_OPTIONS, ...ssrConfiguration.cacheOptions },
      },
    ];
  }

  changeCurrentConfig(newConfig: Record<K, SsrConfigValue>) {
    // If the newConfig has not changed, no action are needed
    if (areRecordsEqual(this.currentConfig, newConfig)) {
      return;
    }

    this.currentConfig = newConfig;
    for (const observableData of this.data.values()) {
      if (!observableData.currentConfig || !isRecordPartial(observableData.currentConfig, newConfig)) {
        const filteredNewConfig = filterConfig(newConfig, observableData.dependencyKeys);
        const observableDataKey = makeConfigKey(filteredNewConfig);
        observableData.observable.set(observableData.latestDataByConfig.get(observableDataKey)?.data);
        observableData.currentConfig = filteredNewConfig;
      }
    }
  }

  /**
   * Clear cache data for expired observable data.
   *
   * @param currentTimestamp timestamp used to determine if the value of the observable is outdated
   */
  clearExpiredObservableData = (currentTimestamp: number) => {
    for (const observableData of this.data.values()) {
      if (observableData.cacheOptions.expireAfterWriteInMillis) {
        for (const [configKey, lastData] of observableData.latestDataByConfig.entries()) {
          if (currentTimestamp - lastData.lastFetchTimestamp
            > observableData.cacheOptions.expireAfterWriteInMillis) {
            observableData.latestDataByConfig.delete(configKey);
          }
        }
      }
    }
  };

  dumpData() {
    return Object.fromEntries(Array.from(this.data.entries()).map(([observableKey, observableData]) => [
      observableKey,
      {
        config: filterConfig(this.currentConfig, observableData.dependencyKeys),
        data: observableData.observable.readOnly().get()?.data,
      },
    ]));
  }

  logData() {
    const printableData = Array.from(this.data.entries()).map(([observableKey, observableData]) => [
      observableKey,
      {
        currentValue: observableData.observable.readOnly().get(),
        latestDataByConfig: Array.from(observableData.latestDataByConfig.entries()),
      },
    ]);
    logger.debug('Dumping observable data...', printableData);
  }
}
