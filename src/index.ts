import { configure, getConsoleSink } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { client, logger } from "$ctx";
import { Events } from "discord.js";

// configure logtape
await configure({
  sinks: {
    console: getConsoleSink({
      formatter: prettyFormatter,
    }),
  },
  loggers: [
    { category: "bot", lowestLevel: "debug", sinks: ["console"] },
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"],
    },
  ],
});

client.once(Events.ClientReady, () => {
  logger.info`Logged in as ${client.user?.tag}`;
});

client.on(Events.Debug, message => logger.debug(message));
client.on(Events.Warn, message => logger.warn(message));
client.on(Events.Error, ({ message }) => logger.error(message));

await client.login(process.env.BOT_TOKEN!);
