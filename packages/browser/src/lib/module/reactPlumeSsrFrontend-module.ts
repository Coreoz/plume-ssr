import { Injector } from 'plume-ts-di';
import {
  SsrLocationContextHolder,
} from '../locationContext/SsrLocationContext';

export function installRectPlumeSsrFrontendModule(injector: Injector) {
  injector.registerSingleton(SsrLocationContextHolder);
}
