import { WritableObservable } from 'micro-observables';
import SampleApi from '../../api/session/SampleApi';
import { SsrBrowserObservableManager } from '../ssr/SsrBrowserObservableManager';

export type SampleEnriched = {
  message: string,
  name: string,
};

/**
 * A sample Service that can be copied.
 * After it has been copied, this file should be deleted :)
 */
export default class SampleService {
  private sampleObservable: WritableObservable<SampleEnriched | undefined>;

  constructor(private readonly sampleApi: SampleApi,
    observableManager: SsrBrowserObservableManager) {
    this.sampleObservable = observableManager.observable('sample');
  }

  sayHello(name: string) {
    return this
      .sampleApi
      .sample(name)
      .then((rawSample) => {
        this.sampleObservable.set({ name, message: rawSample.name });
      });
  }

  currentSample() {
    return this.sampleObservable.readOnly();
  }
}
