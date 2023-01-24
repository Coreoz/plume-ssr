import { LoggerLevel } from 'simple-logging-system';
import dayjs from 'dayjs';
import { LoggerArguments } from './LoggerArguments';

/**
 * Un logger pour mettre les messages dans la console avec un peu de style.
 *
 * Remplace le logger par défaut de nodejs avec console.log pour y ajouter l'heure et les informations de logs.
 */
export class SimpleLogger {
  static logMessage(level: LoggerLevel, loggerName: string, message: string, ...args: unknown[]) {
    SimpleLogger.internalLog(level, SimpleLogger.formatMessage(loggerName, message), ...args);
  }

  private static formatMessage(loggerName: string, message: string) {
    return `${SimpleLogger.formatDate()} ${loggerName}: ${message}`;
  }

  private static formatDate() {
    return dayjs().format('MM-DD HH:mm:ss.SSS');
  }

  private static internalLog(level: LoggerLevel, message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.log(
      `${SimpleLogger.levelToColor(level)}%s\x1b[0m`,
      message,
      args.length === 0 ? '' : JSON.stringify(LoggerArguments.cleanErrorArguments(args)),
    );
  }

  private static levelToColor(level: LoggerLevel) {
    if (level === LoggerLevel.ERROR) {
      // red
      return '\x1b[31m';
    }
    if (level === LoggerLevel.WARN) {
      // yellow
      return '\x1b[33m';
    }
    if (level === LoggerLevel.INFO) {
      // blue
      return '\x1b[34m';
    }
    if (level === LoggerLevel.DEBUG) {
      // gray
      return '\x1b[37m';
    }
    // black
    return '\x1b[30m';
  }
}
