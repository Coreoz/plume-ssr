import { ParsedArgs } from 'minimist';
import fs from 'fs';
import { Logger } from 'simple-logging-system';

const logger = new Logger('ConfigLoader');

/**
 * Permet de charger la configuration depuis un fichier externe & depuis les arguments.
 *
 * On réinvente la roue par ce que nconf est inutilisable avec esbuild,
 * et les autres librairies de chargement de configuration sont des vastes blagues.
 */
export default class ConfigLoader {
  static parse<T>(defaultConfig: T, parsedArgs: ParsedArgs): T {
    let resultConfig = defaultConfig;
    logger.debug('Parsed executable arguments', parsedArgs);
    resultConfig = { ...resultConfig, ...parsedArgs };
    if (parsedArgs.configFile) {
      const confFromFile = JSON.parse(fs.readFileSync(parsedArgs.configFile, 'utf-8'));
      logger.debug('Parsed configuration file', confFromFile);
      resultConfig = { ...resultConfig, ...confFromFile };
    }
    return resultConfig;
  }
}
