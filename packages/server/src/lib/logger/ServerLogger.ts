import { ApplicationLogger } from 'simple-logging-system';
import { SimpleLogger } from './SimpleLogger';
import { ProgramArguments } from '../config/ProgramArguments';
import JsonLogger from './JsonLogger';

/**
 * Remplace le logger par défaut de nodejs
 */
export class ServerLogger {
  private readonly isJsonLogger: boolean;

  constructor(programArguments: ProgramArguments) {
    this.isJsonLogger = Boolean(programArguments.getArgs()['json-logs']);
  }

  // eslint-disable-next-line class-methods-use-this
  setupServerLogs() {
    if (this.isJsonLogger) {
      ApplicationLogger.setLoggerFunction(JsonLogger.logMessage);
    } else {
      ApplicationLogger.setLoggerFunction(SimpleLogger.logMessage);
    }
  }
}
