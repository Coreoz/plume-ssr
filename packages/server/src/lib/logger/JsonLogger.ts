import { LoggerLevel } from 'simple-logging-system';
import dayjs from 'dayjs';
import { LoggerArguments } from './LoggerArguments';

/**
 * Un logger pour écrire les logs en JSON dans la console.
 *
 * Ce logger est notamment utilisé par datadog.
 */
export default class JsonLogger {
  static logMessage(level: LoggerLevel, loggerName: string, message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(JsonLogger.buildLog(level, loggerName, message, ...args)));
  }

  static buildLog(level: LoggerLevel, loggerName: string, message: string, ...args: unknown[]) {
    const cleanArgs = LoggerArguments.cleanErrorArguments(args);
    return {
      '@timestamp': dayjs().toISOString(),
      logger: loggerName,
      level,
      message,
      ...(cleanArgs.length === 1 && typeof cleanArgs[0] === 'object'
        ? { ...cleanArgs[0] }
        : cleanArgs),
    };
  }
}
