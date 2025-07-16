import { Client, GatewayIntentBits } from "discord.js";
import { PrismaClient } from "./generated/prisma";
import { getLogger } from "@logtape/logtape";

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

{
  const logger = getLogger("discord");
  client.on("debug", (message) => logger.debug(message));
  client.on("warn", (message) => logger.warn(message));
  client.on("error", ({ message }) => logger.error(message));
}

export const prisma = new PrismaClient({
  log: [
    { level: "info", emit: "event" },
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

{
  const logger = getLogger("db");
  prisma.$on("info", ({ message }) => logger.info(message));
  prisma.$on("warn", ({ message }) => logger.warn(message));
  prisma.$on("error", ({ message }) => logger.error(message));
}
