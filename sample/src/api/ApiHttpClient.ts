import { HttpMethod, HttpRequest } from 'simple-http-request-builder';
import {
  createHttpFetchRequest, defaultJsonFetchClient, fetchClient, HttpPromise,
} from 'simple-http-rest-client';
import EnvironmentService from '../services/environment/EnvironmentService';
import HttpPromiseMonitor from './HttpPromiseMonitor';

export default class ApiHttpClient {
  private readonly baseUrl;

  constructor(
    environmentService: EnvironmentService,
    private readonly httpPromiseMonitor: HttpPromiseMonitor,
  ) {
    this.baseUrl = environmentService.backendBaseApiUrl();
  }

  rawRequest(method: HttpMethod, path: string): HttpRequest<HttpPromise<Response>> {
    return createHttpFetchRequest(
      this.baseUrl,
      method,
      path,
      this.httpPromiseMonitor.makeMonitor(fetchClient, { method, path }),
    );
  }

  restRequest<T>(method: HttpMethod, path: string): HttpRequest<HttpPromise<T>> {
    return createHttpFetchRequest(
      this.baseUrl,
      method,
      path,
      this.httpPromiseMonitor.makeMonitor(defaultJsonFetchClient, { method, path }),
    );
  }
}
