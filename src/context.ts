import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { PrismaClient } from "./generated/prisma";
import { prettyFormatter } from "@logtape/pretty";
import { Client, Events } from "discord.js";

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

// --- prisma ---
export const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
});
const prismaLogger = getLogger(["prisma"]);
prisma.$on("info" as never, e => prismaLogger.info(e));
prisma.$on("warn" as never, e => prismaLogger.warn(e));
prisma.$on("error" as never, e => prismaLogger.error(e));

// --- discord ---
export const client = new Client({
  intents: [],
});
const discordLogger = getLogger(["discord"]);
client.on(Events.Debug, message => discordLogger.debug(message));
client.on(Events.Warn, message => discordLogger.warn(message));
client.on(Events.Error, ({ message }) => discordLogger.error(message));
