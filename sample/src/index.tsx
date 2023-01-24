import React from 'react';
import 'micro-observables/batchingForReactDom';
import { createBrowserRouter } from 'react-router-dom';
import { configureGlobalInjector, getGlobalInstance, Injector } from 'plume-ts-di';
import './polyfill-loader';
import { renderBrowserApplication } from '@plume-ssr/browser';
import HttpPromiseMonitor from './api/HttpPromiseMonitor';
import installServicesModule from './services/services-module';
import installComponentsModule from './components/components-module';
import App from './components/App';
import installApiModule from './api/api-module';
import installI18nModule from './i18n/i18n-module';
import initializeLocalizedDate from './i18n/messages/LocalizedDate';
import LocaleService from './i18n/locale/LocaleService';

const injector = new Injector();
installServicesModule(injector);
installComponentsModule(injector);
installApiModule(injector);
installI18nModule(injector);

injector.initializeSingletonInstances();

configureGlobalInjector(injector);

// dayjs
initializeLocalizedDate(injector.getInstance(LocaleService));

const reactApp = (
  <React.StrictMode>
    <App createRouter={createBrowserRouter} />
  </React.StrictMode>
);

renderBrowserApplication(reactApp, 'root', [getGlobalInstance(HttpPromiseMonitor)]);
