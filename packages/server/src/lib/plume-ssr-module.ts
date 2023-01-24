import { Injector } from 'plume-ts-di';
import {
  installRectPlumeSsrFrontendModule
} from '@plume-ssr/browser';
import { SsrConfigParser } from './config/SsrConfigParser';
import { ServerLogger } from './logger/ServerLogger';
import { ProgramArguments } from './config/ProgramArguments';
import {
  CurrentHttpRequestContainer,
} from './renderer/CurrentHttpRequestContainer';
import SsrServerDev from './server/SsrServerDev';
import SsrServerProd from './server/SsrServerProd';
import { SsrServerProvider } from './server/SsrServerProvider';
import { SsrServer } from './server/SsrServer';
import { Files } from './files/Files';

export function installSsrModule(injector: Injector) {
  // logger
  injector.registerSingleton(ServerLogger);
  // config
  injector.registerSingleton(ProgramArguments);
  injector.registerSingleton(SsrConfigParser);
  // file
  injector.registerSingleton(Files);
  // server
  injector.registerSingleton(SsrServerDev);
  injector.registerSingleton(SsrServerProd);
  injector.registerSingletonProvider(SsrServerProvider, SsrServer);
  injector.registerSingleton(CurrentHttpRequestContainer);

  installRectPlumeSsrFrontendModule(injector);
}
