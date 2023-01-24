import express from 'express';
import { Logger } from 'simple-logging-system';
import { Files } from '../files/Files';
import { SsrServer } from './SsrServer';
import { SsrConfigProvider } from '../config/SsrConfigProvider';
import { SsrHtmlRenderer } from '../renderer/SsrHtmlRenderer';

const logger = new Logger('ServerProd');

export default class SsrServerProd implements SsrServer {
  constructor(
    private readonly files: Files,
    private readonly config: SsrConfigProvider,
  ) {
  }

  async createExpressServer(
    ssrHtmlRenderer: SsrHtmlRenderer,
  ) {
    const app = express();

    // merci le header inutile d'express...
    app.disable('x-powered-by');

    const { assetsFolderName } = this.config.getSsrBaseConfig();
    app.use(`/${assetsFolderName}`, express.static(this.files.absolutePath(assetsFolderName)));

    app.use('*', async (req, res) => {
      try {
        await ssrHtmlRenderer(req, res, this.files.readFileAsString('index.html'));
      } catch (e) {
        logger.error('Error handling request', e);
        res.status(500).end('Internal error');
      }
    });

    return app;
  }
}
