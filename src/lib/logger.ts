import {
  configure,
  fromAsyncSink,
  getConsoleSink,
  getLogger,
} from "@logtape/logtape";
import { container, LogLevel, type ILogger } from "@sapphire/framework";
import { getPrettyFormatter, prettyFormatter } from "@logtape/pretty";
import type { GuildTextBasedChannel } from "discord.js";
import { getFileSink } from "@logtape/file";
import { isProduction } from "./data";
import fs from "fs/promises";

let logChannel: GuildTextBasedChannel;

const logFileSink = (name: string) =>
  getFileSink(`logs/${name}.log`, {
    lazy: true,
    bufferSize: 8192,
    flushInterval: 5000,
    nonBlocking: true,
    formatter: getPrettyFormatter({ colors: false, align: false }),
  });

// make sure the logs directory exists
if (!isProduction && !(await fs.exists("logs"))) await fs.mkdir("logs");

await configure({
  sinks: {
    console: getConsoleSink({
      formatter: prettyFormatter,
    }),
    discord: fromAsyncSink(async record => {
      if (!isProduction) return; // disable in non-production environments
      if (process.env.LOG_CHANNEL_ID === undefined) return; // disable if no channel is set
      if (!logChannel) {
        // fetch if not already fetched
        logChannel = (await container.client.channels.fetch(
          process.env.LOG_CHANNEL_ID!,
        )) as GuildTextBasedChannel;
      }
      await logChannel.send(`**${record.level}**: ${record.message}`);
    }),
    ...(isProduction && {
      botFile: logFileSink("bot"),
      dbFile: logFileSink("db"),
      apiFile: logFileSink("api"),
    }),
  },
  loggers: [
    {
      category: "bot",
      lowestLevel: "debug",
      sinks: ["console", ...(isProduction ? ["botFile"] : []), "discord"],
    },
    {
      category: "db",
      lowestLevel: "info",
      sinks: ["console", ...(isProduction ? ["dbFile"] : [])],
    },
    {
      category: "api",
      lowestLevel: "debug",
      sinks: ["console", ...(isProduction ? ["apiFile"] : [])],
    },
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"],
    },
  ],
});

const logger = getLogger("bot");

/**
 * {@link ILogger} for Sapphire that wraps the Logtape logger.
 */
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
    for (const value of values) {
      if (value instanceof Error) {
        logger.error(strings, ...values);
        logger.error`${value.stack ?? value.message}`;
        return;
      }
    }
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
