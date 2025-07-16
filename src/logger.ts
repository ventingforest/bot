import {
  configure,
  fromAsyncSink,
  getConsoleSink,
  getLogger,
} from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { client } from "./ctx";
import type { GuildTextBasedChannel } from "discord.js";

let logChannel: GuildTextBasedChannel | null = null;

await configure({
  sinks: {
    console: getConsoleSink({
      formatter: prettyFormatter,
    }),
    discord: fromAsyncSink(async (record) => {
      if (!logChannel) {
        logChannel = (await client.channels.fetch(
          process.env.REPORT_CHANNEL_ID!,
        )) as GuildTextBasedChannel;
      }
      await logChannel.send(`**${record.level}**: ${record.message}`);
    }),
  },
  loggers: [
    { category: "bot", lowestLevel: "debug", sinks: ["console", "discord"] },
    { category: "db", lowestLevel: "info", sinks: ["console"] },
    { category: "discord", lowestLevel: "debug", sinks: ["console"] },
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"],
    },
  ],
});

export default getLogger("bot");
