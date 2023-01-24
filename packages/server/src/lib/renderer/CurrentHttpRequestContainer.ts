import { observable, WritableObservable } from 'micro-observables';
import express from 'express';

/**
 * Contains the current HTTP request.
 *
 * The code depends on the current HTTP request (host name retrieval, language retrieval, etc.),
 * so it will depend on the observable of this class and will be updated at each new request.
 *
 * This pattern works because the node.js code is always executed on a single thread,
 * there is no concurrency management.
 */
export class CurrentHttpRequestContainer {
  private readonly httpRequest: WritableObservable<express.Request | undefined>;

  constructor() {
    this.httpRequest = observable(undefined);
  }

  registerCurrentHttpRequest(httpRequest: express.Request) {
    this.httpRequest.set(httpRequest);
  }

  getCurrentHttpRequest() {
    return this.httpRequest.readOnly();
  }
}
