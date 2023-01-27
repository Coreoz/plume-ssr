// observable
export { SsrObservableManager } from './lib/observable/SsrObservableManager';
export { SsrWritableObservable } from './lib/observable/SsrWritableObservable';
export type { SsrConfigValue, SsrObservableContent } from './lib/observable/SsrWritableObservable';
export { useObservable } from './lib/observable/useObservable';

export type { SsrLocationContext } from './lib/locationContext/SsrLocationContext';
export { SsrLocationContextHolder } from './lib/locationContext/SsrLocationContext';
export { redirect } from './lib/locationContext/Redirect/Redirect';
export { Navigate, useNavigate } from './lib/locationContext/Navigate/Navigate';

export type { BrowserRenderOption } from './lib/renderer/BrowserApplicationRenderer';
export { renderBrowserApplication, extractMonitorContextData } from './lib/renderer/BrowserApplicationRenderer';

export { installRectPlumeSsrFrontendModule } from './lib/module/reactPlumeSsrFrontend-module';
