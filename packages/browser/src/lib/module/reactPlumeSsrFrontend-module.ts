import { Injector } from 'plume-ts-di';
import {
  SsrLocationContextHolder,
} from '../locationcontext/SsrLocationContext';

export function installRectPlumeSsrFrontendModule(injector: Injector) {
  injector.registerSingleton(SsrLocationContextHolder);
}
