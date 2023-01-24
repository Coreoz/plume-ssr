import { Injector } from 'plume-ts-di';
import { installSsrModule } from '../../lib/plume-ssr-module';
import {
  ProgramArguments,
} from '../../lib/config/ProgramArguments';

describe('Tests program arguments', () => {
  test('Check that arguments are correctly read', async () => {
    process.argv = ['node', 'server-ssr.js', '--json-logs', '--httpPort', '3131'];
    const injector = new Injector();
    installSsrModule(injector);
    const programArguments = injector.getInstance(ProgramArguments);

    expect(programArguments.getArgs()).toStrictEqual({
      _: [],
      'json-logs': true,
      httpPort: 3131,
    });
  });
});
