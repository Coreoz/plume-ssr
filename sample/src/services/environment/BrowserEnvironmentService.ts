import EnvironmentService from './EnvironmentService';

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
