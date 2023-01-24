// injector module
export { installSsrModule } from './lib/plume-ssr-module';
// config
export { SsrConfigParser } from './lib/config/SsrConfigParser';
export { SsrConfigProvider, defaultSsrConfig } from './lib/config/SsrConfigProvider';
export type { SsrBaseConfig } from './lib/config/SsrConfigProvider';
export { ProgramArguments } from './lib/config/ProgramArguments';
// logger
export { ServerLogger } from './lib/logger/ServerLogger';
export { SimpleLogger } from './lib/logger/SimpleLogger';
export { LoggerArguments } from './lib/logger/LoggerArguments';
// server
export { SsrServer } from './lib/server/SsrServer';
export { SsrServerProvider } from './lib/server/SsrServerProvider';
// files
export { Files } from './lib/files/Files';
// renderer
export type {
  SsrRenderOption,
  RenderedApplication,
  ApplicationHtmlRenderer,
} from './lib/renderer/SsrApplicationRenderer';
export { renderSsrApplication } from './lib/renderer/SsrApplicationRenderer';
export type { SsrHtmlRenderer } from './lib/renderer/SsrHtmlRenderer';
export { CurrentHttpRequestContainer } from './lib/renderer/CurrentHttpRequestContainer';

// build
export { viteInlineCss } from './lib/build/vite.inline-css';
export { filterImportsPlugin } from './lib/build/esbuild.filter-imports';
// observable
export { SsrServerObservableManager } from './lib/observable/SsrServerObservableManager';
export type { SsrObservableParameters, SsrConfigValue } from './lib/observable/SsrServerObservableManager';
