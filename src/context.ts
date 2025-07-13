import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { prettyFormatter } from "@logtape/pretty";

// --- logtape ---
await configure({
  sinks: {
    console: getConsoleSink({
      formatter: prettyFormatter,
    }),
  },
  loggers: [
    { category: "bot", lowestLevel: "debug", sinks: ["console"] },
    { category: "discord", lowestLevel: "debug", sinks: ["console"] },
    { category: "prisma", lowestLevel: "warning", sinks: ["console"] },
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"],
    },
  ],
});

export const logger = getLogger(["bot"]);

// --- discord ---
export const client = new Client({
  intents: [GatewayIntentBits.GuildMembers],
});
const discordLogger = getLogger(["discord"]);
client.on(Events.Debug, message => discordLogger.debug(message));
client.on(Events.Warn, message => discordLogger.warn(message));
client.on(Events.Error, ({ message }) => discordLogger.error(message));
