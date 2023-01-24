import express from 'express';
import { Logger } from 'simple-logging-system';
import { Files } from '../files/Files';
import { SsrHtmlRenderer } from '../renderer/SsrHtmlRenderer';
import { SsrServer } from './SsrServer';
import { SsrConfigProvider } from '../config/SsrConfigProvider';

const logger = new Logger('ServerDev');

export default class SsrServerDev implements SsrServer {
  constructor(
    private readonly files: Files,
    private readonly config: SsrConfigProvider,
  ) {
  }

  async createExpressServer(ssrHtmlRenderer: SsrHtmlRenderer) {
    const app = express();
    // Dynamic import is used to avoid node loading Vite whereas it is not bundled in production
    const vite = await (await import('vite')).createServer({
      root: this.config.getSsrBaseConfig().rootFolder,
      logLevel: 'info',
      server: {
        middlewareMode: true,
      },
      appType: 'custom',
    });
    // use vite's connect instance as middleware
    app.use(vite.middlewares);

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        // always read fresh template in dev
        const htmlTemplate: string = await vite.transformIndexHtml(
          url,
          this.files.readFileAsString('index.html'),
        );

        await ssrHtmlRenderer(req, res, htmlTemplate);
      } catch (e) {
        if (e && typeof e === 'object' && e instanceof Error) {
          vite.ssrFixStacktrace(e);
        }
        logger.error('Error handling request', { error: e });
        res.status(500).end('Internal error, see logs for details');
      }
    });

    return app;
  }
}
