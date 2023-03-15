// observable
export { SsrObservableManager } from './lib/observable/SsrObservableManager';
export { SsrWritableObservable } from './lib/observable/SsrWritableObservable';
export type { SsrConfigValue, SsrObservableContent } from './lib/observable/SsrWritableObservable';
export { useObservable } from './lib/observable/useObservable';

export type { SsrLocationContext } from './lib/locationcontext/SsrLocationContext';
export { SsrLocationContextHolder } from './lib/locationcontext/SsrLocationContext';
export { redirect } from './lib/locationcontext/redirect/Redirect';
export { Navigate, useNavigate } from './lib/locationcontext/navigate/Navigate';

export type { BrowserRenderOption } from './lib/renderer/BrowserApplicationRenderer';
export { renderBrowserApplication, extractMonitorContextData } from './lib/renderer/BrowserApplicationRenderer';

export { installRectPlumeSsrFrontendModule } from './lib/module/reactPlumeSsrFrontend-module';
