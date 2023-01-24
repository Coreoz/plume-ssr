import { Provider } from 'plume-ts-di';
import { SsrServer } from './SsrServer';
import SsrServerProd from './SsrServerProd';
import SsrServerDev from './SsrServerDev';
import { SsrConfigProvider } from '../config/SsrConfigProvider';

export class SsrServerProvider implements Provider<SsrServer> {
  private readonly server: SsrServer;

  constructor(config: SsrConfigProvider, serverProd: SsrServerProd, serverDev: SsrServerDev) {
    this.server = config.getSsrBaseConfig().isDevelopment ? serverDev : serverProd;
  }

  get(): SsrServer {
    return this.server;
  }
}
