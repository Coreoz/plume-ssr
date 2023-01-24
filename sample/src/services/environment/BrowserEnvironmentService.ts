import EnvironmentService from './EnvironmentService';

/* eslint-disable class-methods-use-this */
export default class BrowserEnvironmentService implements EnvironmentService {
  backendBaseApiUrl(): string {
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  acceptedLanguageCodes(): string[] {
    return navigator.languages as string[];
  }

  fetchUrlPath(): string {
    return window.location.pathname;
  }
}
