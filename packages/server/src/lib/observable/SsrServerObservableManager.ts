import { Observable, observable, WritableObservable } from 'micro-observables';
import express from 'express';
import { Logger } from 'simple-logging-system';
import { SsrObservableManager } from '@plume-ssr/browser';

/**
 * Describes an observable parameter, for instance:
 * - {name: 'configuration', dependencyKeys: ['siteId']}
 * - {name: 'cms-page', dependencyKeys: ['siteId', 'lang', 'pageAlias']}
 */
export type SsrObservableParameters<K extends string> = {
  name: string,
  dependencyKeys: K[],
  // TODO add options here: cache duration, max entries, etc. + clean up task
};

/**
 * A configuration value: it should be a simple type, not a full object
 */
export type SsrConfigValue = string | number | boolean | undefined;

/**
 * Describes the internal structure of the observable data
 */
type SsrObservableData<K extends string> = {
  observable: WritableObservable<unknown>,
  dependencyKeys: Set<K>,
  currentConfigFiltered: Record<K, SsrConfigValue>,
  latestDataByConfig: Map<string, unknown>,
};

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

const logger = new Logger('SsrServerObservable');

/**
 * Create a Map composite key that:
 * - Is filtered by the dependencyKeys
 * - Is comparable no matter the object properties order
 *
 * So for example, `makeConfigKey({a: 1, b: 2, c: 3}, new Set(['a', 'b']))`
 * will be equals to `makeConfigKey({d: 4, b: 2, a: 1}, new Set(['a', 'b']))`
 */
export const makeConfigKey = (config: Record<string, unknown>, dependencyKeys: Set<string>) =>
  // In JS, Map cannot use a composite key, to it has to be stringified
  // eslint-disable-next-line implicit-arrow-linebreak
  JSON.stringify(
    config,
    Object.keys(config)
      // Use only keys that make sense for the observable
      .filter((key) => dependencyKeys.has(key))
      // Make sure that even if the keys are in the wrong order, it matches the same key
      .sort(),
  );

/**
 * Implements `SsrObservable` in a way observables will be updated each time
 * the current `express.Request` is updated.
 *
 * This enables to cache data for SSR while making sure there will be not
 * data conflict when multiple incoming requests are handled "at the same time"
 */
export class SsrServerObservableManager<K extends string> extends SsrObservableManager {
  private data: Map<string, SsrObservableData<K>>;

  private currentConfig: Record<K, unknown>;

  /**
   * Creates a new `SsrServerObservableManager`
   * @param requestConfigKeyExtractor Takes a `express.Request` and extract the corresponding configuration.
   * It might for instance returns `{lang: 'en', siteId: '1234', pageAlias: 'homepage'}`
   * @param currentHttpRequestObservable The observable that must be updated each time
   * some information will be rendered Server side.
   * @param observableParameters The parameters of each observable in the application
   */
  constructor(
    requestConfigKeyExtractor: (request: express.Request) => Record<K, SsrConfigValue>,
    currentHttpRequestObservable: Observable<express.Request | undefined>,
    observableParameters: SsrObservableParameters<K>[],
  ) {
    super();
    this.currentConfig = {} as Record<K, unknown>;
    this.data = new Map(observableParameters
      .map(SsrServerObservableManager.createObservableData)
      .map(([observableName, observableData]) => {
        observableData.observable.subscribe((newData) => {
          // Replace the latest data value for the current config
          observableData.latestDataByConfig.set(
            makeConfigKey(this.currentConfig, observableData.dependencyKeys),
            newData,
          );
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

  override observable<T>(observableName: string): WritableObservable<T | undefined> {
    let dataObservable = this.data.get(observableName)?.observable;
    if (!dataObservable) {
      logger.error(
        `No SSR configuration has been made for observable ${observableName} whereas it should be mandatory.`
        + ' Returning a fresh observable that will not change for each request... '
        + 'This will likely lead to content error.',
      );
      dataObservable = observable(undefined);
    }
    return dataObservable as WritableObservable<T>;
  }

  private static createObservableData<K extends string>(
    ssrConfiguration: SsrObservableParameters<K>,
  ): [string, SsrObservableData<K>] {
    return [
      ssrConfiguration.name,
      {
        observable: observable(undefined),
        dependencyKeys: new Set(ssrConfiguration.dependencyKeys),
        currentConfigFiltered: {} as Record<K, SsrConfigValue>,
        latestDataByConfig: new Map(),
      },
    ];
  }

  changeCurrentConfig(newConfig: Record<K, SsrConfigValue>) {
    // If the newConfig has not changed, no action are needed
    if (areRecordsEqual(this.currentConfig, newConfig)) {
      return;
    }

    this.currentConfig = newConfig;
    const newConfigKeys = Object.keys(newConfig);
    for (const observableData of this.data.values()) {
      const filteredNewConfig = newConfigKeys
        .filter((key) => observableData.dependencyKeys.has(key as K))
        .reduce((filteredConfig: Record<K, SsrConfigValue>, key) => {
          // eslint-disable-next-line no-param-reassign
          filteredConfig[key as K] = newConfig[key as K];
          return filteredConfig;
        }, {} as Record<K, SsrConfigValue>);
      if (!areRecordsEqual(filteredNewConfig, observableData.currentConfigFiltered)) {
        const observableDataKey = makeConfigKey(this.currentConfig, observableData.dependencyKeys);
        observableData.observable.set(observableData.latestDataByConfig.get(observableDataKey));
        observableData.currentConfigFiltered = filteredNewConfig;
      }
    }
  }

  logData() {
    const printableData = Array.from(this.data.entries()).map(([observableKey, observableData]) => [
      observableKey,
      {
        currentValue: observableData.observable.get(),
        dependencyKeys: Array.from(observableData.dependencyKeys.values()),
        currentConfigFiltered: observableData.currentConfigFiltered,
        latestDataByConfig: Array.from(observableData.latestDataByConfig.entries()),
      },
    ]);
    logger.debug('Dumping observable data...', printableData);
  }
}
