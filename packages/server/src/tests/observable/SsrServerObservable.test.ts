import { observable } from 'micro-observables';
import express from 'express';
import {
  areRecordsEqual, isRecordPartial,
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

test('Verify isRecordPartial correctness', () => {
  expect(isRecordPartial({ a: 1 }, { a: 1, b: 2 })).toBeTruthy();
  expect(areRecordsEqual({ a: 1 }, {})).toBeFalsy();
  expect(areRecordsEqual({ b: 2, a: 1 }, { a: 1, b: 2 })).toBeTruthy();
  expect(areRecordsEqual({ a: 1 }, { a: undefined })).toBeFalsy();
});

test('Verify makeConfigKey correctness', () => {
  expect(makeConfigKey({ a: 1, b: 2 }))
    .toStrictEqual(makeConfigKey({ b: 2, a: 1 }));
  expect(makeConfigKey({ a: 1, b: 2 }))
    .toStrictEqual(makeConfigKey({ a: 1, b: 2 }));
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

const makeData = (value: string, lang: string, page: string) => ({
  data: value,
  config: { lang, page },
});

describe('Tests SsrServerObservableManager', () => {
  test('Check that configuration is correctly read', () => {
    const observableManager = newSsrServerObservableManager();
    expect(observableManager).toBeDefined();
  });
  test('Check that observable creation initialize observable as undefined', () => {
    const observableManager = newSsrServerObservableManager();
    expect(observableManager.observable('page-header').readOnly().get()).toBeUndefined();
  });
  test('ChangeCurrentConfig change observable value scenario', () => {
    const observableManager = newSsrServerObservableManager();
    const pageHeaderObservable = observableManager.observable('page-header');
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    pageHeaderObservable.set(makeData('valueForFrAndHome', 'fr', 'home'));
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'legal', siteId: 'abc' });
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
    pageHeaderObservable.set(makeData('valueForFrAndLegal', 'fr', 'legal'));
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    expect(pageHeaderObservable.data().get()).toStrictEqual('valueForFrAndHome');
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'legal', siteId: 'abc' });
    expect(pageHeaderObservable.data().get()).toStrictEqual('valueForFrAndLegal');
    observableManager.changeCurrentConfig({ lang: 'en', page: 'legal', siteId: 'abc' });
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
  });
  test('ChangeCurrentConfig check that observable update is not triggered when no change occurs', () => {
    const observableManager = newSsrServerObservableManager();
    let changeCount = 0;
    const pageHeaderObservable = observableManager.observable('page-header');
    pageHeaderObservable.readOnly().subscribe(() => {
      changeCount += 1;
    });
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    pageHeaderObservable.set(makeData('frHomeAbc', 'fr', 'home'));
    expect(changeCount).toStrictEqual(1);
    observableManager.changeCurrentConfig({ lang: 'en', page: 'home', siteId: 'abc' });
    expect(changeCount).toStrictEqual(2);
    // the observable is not yet defined for the new config
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
    pageHeaderObservable.set(makeData('enHomeAbc', 'en', 'home'));
    expect(changeCount).toStrictEqual(3);
    // the config is not changed, so no more change
    observableManager.changeCurrentConfig({ lang: 'en', page: 'home', siteId: 'abc' });
    expect(changeCount).toStrictEqual(3);
    // a new and unknown config is used, so the observable must be changed and to be undefined
    observableManager.changeCurrentConfig({ lang: 'en', page: undefined, siteId: 'abc' });
    observableManager.changeCurrentConfig({ lang: 'en', page: undefined, siteId: 'abc' });
    expect(changeCount).toStrictEqual(4);
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
  });
  test('Verify that request change triggers observable update', () => {
    const observableManager = newSsrServerObservableManager();
    const pageHeaderObservable = observableManager.observable('page-header');
    observableManager.changeCurrentConfig({ lang: 'en', page: 'home', siteId: 'abc' });
    pageHeaderObservable.set(makeData('enHomeAbc', 'en', 'home'));
    // change config to {lang: 'fr', page: 'home', siteId: true}, see requestKeysExtractor
    requestObservable.set({} as express.Request);
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
  });
  test('Verify that config change for uninitialized data makes observable undefined', () => {
    const observableManager = newSsrServerObservableManager();
    const pageHeaderObservable = observableManager.observable('page-header');
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
    pageHeaderObservable.set(makeData('enHomeAbc', 'en', 'home'));
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
  });
  test('Verify that config change and observable data are independant', () => {
    const observableManager = newSsrServerObservableManager();
    const pageHeaderObservable = observableManager.observable('page-header');
    observableManager.changeCurrentConfig({ lang: 'fr', page: 'home', siteId: 'abc' });
    pageHeaderObservable.set(makeData('enHomeAbc', 'en', 'home'));
    expect(pageHeaderObservable.readOnly().get()).toBeUndefined();
    observableManager.changeCurrentConfig({ lang: 'en', page: 'home', siteId: 'abc' });
    expect(pageHeaderObservable.data().get()).toStrictEqual('enHomeAbc');
  });
});
