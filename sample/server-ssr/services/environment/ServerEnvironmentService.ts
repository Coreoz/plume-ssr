/* eslint-disable class-methods-use-this */
import express from 'express';
import { Observable } from 'micro-observables';
import { CurrentHttpRequestContainer } from '@plume-ssr/server';
import EnvironmentService from '../../../src/services/environment/EnvironmentService';
import { ConfigProvider } from '../../config/ConfigProvider';

/**
 * Gère la récupération des informations sur l'environnement d'exécution pour le navigateur
 */
export default class ServerEnvironmentService implements EnvironmentService {
  private readonly currentRequest: Observable<express.Request | undefined>;

  private readonly baseApiUrl: string;

  constructor(configProvider: ConfigProvider, currentHttpRequestContainer: CurrentHttpRequestContainer) {
    this.baseApiUrl = configProvider.getSsrBaseConfig().backEndUrl;
    this.currentRequest = currentHttpRequestContainer.getCurrentHttpRequest();
  }

  backendBaseApiUrl(): string {
    return this.baseApiUrl;
  }

  acceptedLanguageCodes(): string[] {
    return this.currentRequest.get()?.acceptsLanguages() ?? [];
  }

  fetchUrlPath(): string {
    return this.currentRequest.get()?.originalUrl ?? 'server-path-http-request-missing';
  }
}
