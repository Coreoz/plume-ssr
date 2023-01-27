import { SsrWritableObservable } from 'plume-ssr-browser';
import SampleApi from '../../api/session/SampleApi';
import { SsrBrowserObservableManager, SsrObservableKey } from '../ssr/SsrBrowserObservableManager';

/**
 * A sample Service that can be copied.
 * After it has been copied, this file should be deleted :)
 */
export default class SampleService {
  private sampleObservable: SsrWritableObservable<string, SsrObservableKey>;

  constructor(private readonly sampleApi: SampleApi,
    observableManager: SsrBrowserObservableManager) {
    this.sampleObservable = observableManager.observable('sample');
  }

  sayHello(name: string) {
    return this
      .sampleApi
      .sample(name)
      .then((rawSample) => {
        this.sampleObservable.set({ config: { pageName: name }, data: rawSample.name });
      });
  }

  currentSample() {
    return this.sampleObservable.readOnly();
  }
}
