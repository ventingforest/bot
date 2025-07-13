import { configure, getConsoleSink } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { client, logger } from "$ctx";

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

client.once("ready", () => {
  logger.info`Logged in as ${client.user?.tag}`;
});

await client.login(process.env.BOT_TOKEN!);
