import {
  configure,
  fromAsyncSink,
  getConsoleSink,
  getLogger,
} from "@logtape/logtape";
import { getPrettyFormatter, prettyFormatter } from "@logtape/pretty";
import type { GuildTextBasedChannel } from "discord.js";
import { container } from "@sapphire/framework";
import { getFileSink } from "@logtape/file";
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

const isProduction = process.env.NODE_ENV === "production";
const isTool = (process.argv[1] || "").includes("tools");
const logToDiscord = !isTool && isProduction && process.env.LOG_CHANNEL_ID;

// make sure the logs directory exists
if (isProduction && !(await fs.exists("logs"))) await fs.mkdir("logs");

await configure({
  sinks: {
    console: getConsoleSink({
      formatter: prettyFormatter,
    }),
    ...(logToDiscord && {
      discord: fromAsyncSink(async record => {
        if (!logChannel) {
          // fetch if not already fetched
          logChannel = (await container.client.channels.fetch(
            process.env.LOG_CHANNEL_ID!,
          )) as GuildTextBasedChannel;
        }
        await logChannel.send(`**${record.level}**: ${record.message}`);
      }),
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
      sinks: [
        "console",
        ...(isProduction ? ["botFile"] : []),
        ...(logToDiscord ? ["discord"] : []),
      ],
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
export default logger;
