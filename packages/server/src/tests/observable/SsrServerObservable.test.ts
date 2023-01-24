import { observable } from 'micro-observables';
import express from 'express';
import {
  areRecordsEqual,
  makeConfigKey,
  SsrObservableParameters,
  SsrServerObservableManager,
} from '../../lib/observable/SsrServerObservableManager';

test('Verify areRecordsEqual correctness', () => {
  expect(areRecordsEqual({ a: 1 }, { a: 1 })).toBeTruthy();
  expect(areRecordsEqual({}, { a: 1 })).toBeFalsy();
  expect(areRecordsEqual({ b: 2, a: 1 }, { a: 1, b: 2 })).toBeTruthy();
  expect(areRecordsEqual({ a: 1 }, {})).toBeFalsy();
  expect(areRecordsEqual({ a: 1 }, { a: undefined })).toBeFalsy();
});

test('Verify makeConfigKey correctness', () => {
  expect(makeConfigKey({ a: 1, b: 2, c: 3 }, new Set(['a', 'b'])))
    .toStrictEqual(makeConfigKey({ d: 4, b: 2, a: 1 }, new Set(['a', 'b'])));
  expect(makeConfigKey({}, new Set(['a', 'b'])))
    .toStrictEqual(makeConfigKey({ d: 4 }, new Set(['a', 'b'])));
  expect(makeConfigKey({ a: undefined }, new Set(['a', 'b'])))
    .toStrictEqual('{}');
});

type ObservableKeys = 'lang' | 'page' | 'siteId';

const requestKeysExtractor = () => ({
  lang: 'fr',
  page: 'home',
  siteId: true,
});

const observables: SsrObservableParameters<ObservableKeys>[] = [
  {
    name: 'page-header',
    dependencyKeys: ['lang', 'page'],
  },
];

const requestObservable = observable<express.Request | undefined>(undefined);

const newSsrServerObservableManager = () => new SsrServerObservableManager(
  requestKeysExtractor, requestObservable, observables,
);

describe('Tests SsrServerObservableManager', () => {
  test('Check that configuration is correctly read', () => {
    const observableManager = newSsrServerObservableManager();
    expect(observableManager).toBeDefined();
  });
  test('Check that observable creation initialize observable as undefined', () => {
    const observableManager = newSsrServerObservableManager();
    expect(observableManager.observable('page-header').get()).toBeUndefined();
  });
  test('ChangeCurrentConfig change observable value scenario', () => {
    const observableManager = newSsrServerObservableManager();
    const pageHeaderObservable = observableManager.observable('page-header');
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    expect(pageHeaderObservable.get()).toBeUndefined();
    pageHeaderObservable.set('valueForFrAndHome');
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'legal', siteId: 'abc' });
    expect(pageHeaderObservable.get()).toBeUndefined();
    pageHeaderObservable.set('valueForFrAndLegal');
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    expect(pageHeaderObservable.get()).toStrictEqual('valueForFrAndHome');
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'legal', siteId: 'abc' });
    expect(pageHeaderObservable.get()).toStrictEqual('valueForFrAndLegal');
    observableManager.changeCurrentConfig({ lang: 'en', page: 'legal', siteId: 'abc' });
    expect(pageHeaderObservable.get()).toBeUndefined();
  });
  test('ChangeCurrentConfig check that observable update is not triggered when no change occurs', () => {
    const observableManager = newSsrServerObservableManager();
    let changeCount = 0;
    const pageHeaderObservable = observableManager.observable('page-header');
    pageHeaderObservable.subscribe(() => {
      changeCount += 1;
    });
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    pageHeaderObservable.set('frHomeAbc');
    expect(changeCount).toStrictEqual(1);
    observableManager.changeCurrentConfig({ lang: 'en', page: 'home', siteId: 'abc' });
    expect(changeCount).toStrictEqual(2);
    // the observable is not yet defined for the new config
    expect(pageHeaderObservable.get()).toBeUndefined();
    pageHeaderObservable.set('enHomeAbc');
    expect(changeCount).toStrictEqual(3);
    // the config is not changed, so no more change
    observableManager.changeCurrentConfig({ lang: 'en', page: 'home', siteId: 'abc' });
    expect(changeCount).toStrictEqual(3);
    // a new and unknown config is used, so the observable must be changed and to be undefined
    observableManager.changeCurrentConfig({ lang: 'en', page: undefined, siteId: 'abc' });
    observableManager.changeCurrentConfig({ lang: 'en', page: undefined, siteId: 'abc' });
    expect(changeCount).toStrictEqual(4);
    expect(pageHeaderObservable.get()).toBeUndefined();
  });
  test('Verify that request change triggers observable update', () => {
    const observableManager = newSsrServerObservableManager();
    const pageHeaderObservable = observableManager.observable('page-header');
    observableManager.changeCurrentConfig({ lang: 'en', page: 'home', siteId: 'abc' });
    pageHeaderObservable.set('enHomeAbc');
    // change config to {lang: 'fr', page: 'home', siteId: true}, see requestKeysExtractor
    requestObservable.set({} as express.Request);
    expect(pageHeaderObservable.get()).toBeUndefined();
  });
  test('Verify that config change for uninitialized data makes observable undefined', () => {
    const observableManager = newSsrServerObservableManager();
    const pageHeaderObservable = observableManager.observable('page-header');
    expect(pageHeaderObservable.get()).toBeUndefined();
    pageHeaderObservable.set('enHomeAbc');
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    expect(pageHeaderObservable.get()).toBeUndefined();
  });
});
