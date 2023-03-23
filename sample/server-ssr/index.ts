import { configureGlobalInjector, Injector } from 'plume-ts-di';
import {
  CurrentHttpRequestContainer,
  installSsrModule, ServerLogger, SsrServer,
} from 'plume-ssr-server';
import { Logger } from 'simple-logging-system';
import { SsrLocationContextHolder } from 'plume-ssr-browser';
import { Scheduler } from 'simple-job-scheduler';
import * as nodeUtil from 'util';
import installApiModule from '../src/api/api-module';
import installComponentsModule from '../src/components/components-module';
import installI18nModule from '../src/i18n/i18n-module';
import LocaleService from '../src/i18n/locale/LocaleService';
import initializeLocalizedDate from '../src/i18n/messages/LocalizedDate';
import installServicesModule from '../src/services/services-module';
import { ConfigProvider } from './config/ConfigProvider';
import ServerSsrObservableManager from './observable/ServerSsrObservableManager';
import ssrRequestHandler from './requestHandler/SsrRequestHandler';
import installServerModule from './server-module';
import HttpPromiseMonitor from '../src/api/HttpPromiseMonitor';

const logger = new Logger('index');
// so logs contain all objects
nodeUtil.inspect.defaultOptions.depth = null;

const currentMillis = Date.now();

const injector = new Injector();
installServicesModule(injector);
installComponentsModule(injector);
installApiModule(injector);
installI18nModule(injector);
installSsrModule(injector);
installServerModule(injector);

// configure logging for server
injector.getInstance(ServerLogger).setupServerLogs();

injector.initializeSingletonInstances();

configureGlobalInjector(injector);

// dayjs
initializeLocalizedDate(injector.getInstance(LocaleService));

const config = injector.getInstance(ConfigProvider).getSsrBaseConfig();

const scheduler = injector.getInstance(Scheduler);
scheduler.schedule(
  'Clean SSR observable cache',
  () => injector.getInstance(ServerSsrObservableManager).clearExpiredObservableData(Date.now()),
  // every minute
  60000,
);

injector.getInstance(SsrServer)
  .createExpressServer(ssrRequestHandler(
    injector.getInstance(CurrentHttpRequestContainer),
    injector.getInstance(SsrLocationContextHolder),
    injector.getInstance(HttpPromiseMonitor),
  ))
  .then((app) => {
    app.listen(config.httpPort, () => {
      logger.info(`Server started in ${Date.now() - currentMillis}ms at http://localhost:${config.httpPort}`);
    });
  });

// if (this.config.hasBackendProxy()) {
//     app.use(
//         '/api',
//         createProxyMiddleware({
//             target: this.config.backendBaseApiUrl(),
//             // doit être à false, sinon l'origin est toujours localhost... :)
//             changeOrigin: false,
//             prependPath: false,
//         }),
//     );
// }
