import { PrismaClient } from "./generated/prisma";
import { getLogger } from "@logtape/logtape";
import type { Client } from "discord.js";
import { guildId } from "$const";
import type Logger from "$log";

export const prisma = new PrismaClient({
  log: [
    { level: "info", emit: "event" },
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

// log prisma events
{
  const logger = getLogger(["db"]);
  prisma.$on("info", ({ message }) => logger.info(message));
  prisma.$on("warn", ({ message }) => logger.warn(message));
  prisma.$on("error", ({ message }) => logger.error(message));
}

/**
 * Synchronises the database with the current state of the guild.
 */
export async function synchronise(client: Client, logger: Logger) {
  logger.info`Synchronising database with current guild state...`;

  const guild = await client.guilds.fetch(guildId);
  const members = await guild.members
    .fetch()
    .then(members => Array.from(members.values()));
  const upserts = members.map(({ user: { id, username } }) =>
    prisma.user.upsert({
      where: { id },
      update: { username, present: true },
      create: { id, username, present: true },
    }),
  );
  const markNotPresent = prisma.user.updateMany({
    where: { id: { notIn: members.map(m => m.user.id) } },
    data: { present: false },
  });

  await prisma.$transaction([...upserts, markNotPresent]);

  logger.info`Database synchronised!`;
}
