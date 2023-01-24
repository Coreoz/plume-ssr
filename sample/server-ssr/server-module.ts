import { Injector } from 'plume-ts-di';
import { SsrConfigProvider } from '@plume-ssr/server';
import EnvironmentService from '../src/services/environment/EnvironmentService';
import { ConfigProvider } from './config/ConfigProvider';
import ServerEnvironmentService from './services/environment/ServerEnvironmentService';
import ServerSsrObservableManager from './observable/ServerSsrObservableManager';
import { SsrBrowserObservableManager } from '../src/services/ssr/SsrBrowserObservableManager';

export default function installServerModule(injector: Injector) {
  // config
  injector.registerSingleton(ConfigProvider);
  injector.registerSingleton(ConfigProvider, SsrConfigProvider);
  injector.registerSingleton(ServerEnvironmentService, EnvironmentService);
  // browser observable
  injector.registerSingleton(ServerSsrObservableManager);
  injector.registerSingleton(ServerSsrObservableManager, SsrBrowserObservableManager);
}
