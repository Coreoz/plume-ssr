import { Injector } from 'plume-ts-di';
import { installSsrModule } from '../../lib/plume-ssr-module';
import {
  SsrConfigParser,
} from '../../lib/config/SsrConfigParser';
import {
  defaultSsrConfig,
  SsrBaseConfig,
} from '../../lib/config/SsrConfigProvider';

export type SsrTestConfig = SsrBaseConfig & {
  customValue: string,
};

const defaultConfig = {
  ...defaultSsrConfig,
  customValue: 'hello',
};

describe('Tests config parsing', () => {
  test('Check that configuration is correctly read', async () => {
    process.argv = ['node', 'server-ssr.js', '--configFile', 'src/tests/config/conf-test.json'];
    const injector = new Injector();
    installSsrModule(injector);
    const config = injector.getInstance(SsrConfigParser);
    const parsedConfig = config.readServerConfig<SsrTestConfig>(defaultConfig);

    expect(parsedConfig).toMatchObject({
      ...defaultConfig,
      isDevelopment: false,
      customValue: 'override',
    });
  });

  test('Check that default configuration is used when there is no config file', async () => {
    process.argv = ['node', 'server-ssr.js'];
    const injector = new Injector();
    installSsrModule(injector);
    const config = injector.getInstance(SsrConfigParser);
    const parsedConfig = config.readServerConfig<SsrTestConfig>(defaultConfig);

    expect(parsedConfig).toMatchObject(defaultConfig);
  });

  test('Check that parameters can override default configuration', async () => {
    process.argv = ['node', 'server-ssr.js', '--httpPort', '3131'];
    const injector = new Injector();
    installSsrModule(injector);
    const config = injector.getInstance(SsrConfigParser);
    const parsedConfig = config.readServerConfig<SsrTestConfig>(defaultConfig);

    expect(parsedConfig).toMatchObject({
      ...defaultConfig,
      httpPort: 3131,
    });
  });
});
