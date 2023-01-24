import { Injector } from 'plume-ts-di';
import ApiHttpClient from './ApiHttpClient';
import HttpPromiseMonitor from './HttpPromiseMonitor';
import SampleApi from './session/SampleApi';

export default function installApiModule(injector: Injector) {
  injector.registerSingleton(ApiHttpClient);
  injector.registerSingleton(SampleApi);
  injector.registerSingleton(HttpPromiseMonitor);
}
