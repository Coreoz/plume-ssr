import {
  SsrBaseConfig, SsrConfigParser, SsrConfigProvider, defaultSsrConfig,
} from '@plume-ssr/server';
import * as path from 'path';

export type ConfigType = SsrBaseConfig & {
  sample: string,
  backEndUrl: string
};

const defaultConfig: ConfigType = {
  ...defaultSsrConfig,
  rootFolder: path.resolve(process.cwd()),
  sample: 'hello',
  backEndUrl: 'http://localhost:3000/api',
};

export class ConfigProvider extends SsrConfigProvider {
  private readonly config: ConfigType;

  constructor(configParser: SsrConfigParser) {
    super();
    this.config = configParser.readServerConfig(defaultConfig);
  }

  override getSsrBaseConfig() {
    return this.config;
  }
}
