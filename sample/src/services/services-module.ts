import { Scheduler } from 'simple-job-scheduler';
import { Injector } from 'plume-ts-di';
import BrowserEnvironmentService from './environment/BrowserEnvironmentService';
import EnvironmentService from './environment/EnvironmentService';
import SampleService from './sample/SampleService';
import { SsrBrowserObservableManager } from './ssr/SsrBrowserObservableManager';

export default function installServicesModule(injector: Injector) {
  injector.registerSingleton(Scheduler);
  // sample service to delete
  injector.registerSingleton(SampleService);
  injector.registerSingleton(BrowserEnvironmentService, EnvironmentService);
  // browser observable
  injector.registerSingleton(SsrBrowserObservableManager);
}
