import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { LogLevel, type ILogger } from "@sapphire/framework";
import { prettyFormatter } from "@logtape/pretty";

await configure({
  sinks: {
    console: getConsoleSink({
      formatter: prettyFormatter,
    }),
  },
  loggers: [
    { category: "bot", lowestLevel: "debug", sinks: ["console"] },
    { category: "db", lowestLevel: "info", sinks: ["console"] },
    { category: "discord", lowestLevel: "debug", sinks: ["console"] },
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"],
    },
  ],
});

const logger = getLogger(["bot"]);

export default class Logger implements ILogger {
  has(_: LogLevel): boolean {
    return true;
  }

  trace(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
    logger.trace(strings, ...values);
  }

  debug(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
    logger.debug(strings, ...values);
  }

  info(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
    logger.info(strings, ...values);
  }

  warn(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
    logger.warn(strings, ...values);
  }

  error(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
    logger.error(strings, ...values);
  }

  fatal(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
    logger.fatal(strings, ...values);
  }

  write(
    level: LogLevel,
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): void {
    switch (level) {
      case LogLevel.Trace:
        this.trace(strings, ...values);
        break;
      case LogLevel.Debug:
        this.debug(strings, ...values);
        break;
      case LogLevel.Info:
        this.info(strings, ...values);
        break;
      case LogLevel.Warn:
        this.warn(strings, ...values);
        break;
      case LogLevel.Error:
        this.error(strings, ...values);
        break;
      case LogLevel.Fatal:
        this.fatal(strings, ...values);
        break;
      default:
        throw new Error(`Unknown log level: ${level}`);
    }
  }
}
