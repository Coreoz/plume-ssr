/**
 * Utility methods for loggers
 */
export class LoggerArguments {
  static cleanErrorArguments(args: unknown[]) {
    return args.map(LoggerArguments.cleanErrorArgument);
  }

  private static cleanErrorArgument<T>(arg: T): T | object {
    return arg instanceof Error
      ? LoggerArguments.toErrorObject(arg)
      : arg;
  }

  /**
   * Transform an Error into a simple Object to be able to stringify it.
   *
   * This is needed, because `JSON.stringify(new Error())` returns `{}`... :(
   */
  private static toErrorObject(error: Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
}
