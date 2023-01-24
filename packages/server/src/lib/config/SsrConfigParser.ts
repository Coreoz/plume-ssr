import { Logger } from 'simple-logging-system';
import ConfigLoader from './ConfigLoader';
import { ProgramArguments } from './ProgramArguments';
import { SsrBaseConfig } from './SsrConfigProvider';

const logger = new Logger('SsrConfigParser');

/**
 * A utiliser en mode delegate avec la config du projet
 */
export class SsrConfigParser {
  constructor(private readonly programArguments: ProgramArguments) {
  }

  readServerConfig<T extends SsrBaseConfig>(defaultConfig: T): T {
    const configValue = ConfigLoader.parse(defaultConfig, this.programArguments.getArgs());

    // permet de préciser le mode de fonctionnement des librairies externes
    // => certaines ont un mode de fonctionnement différent entre le développement local et la production (le reste)
    process.env.NODE_ENV = configValue.isDevelopment ? 'development' : 'production';

    logger.debug('Configuration loaded', configValue);
    return configValue as T;
  }
}
