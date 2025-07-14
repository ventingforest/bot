import type { GuildMember, PartialGuildMember } from "discord.js";
import { PrismaClient } from "../generated/prisma";
import { container } from "@sapphire/framework";
import { getLogger } from "@logtape/logtape";
import { guildId } from "$const";

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

const { client, logger } = container;

/**
 * Synchronises the database with the current state of the guild.
 */
export async function synchroniseGuild() {
  logger.info`Synchronising database with current guild state...`;

  const guild = await client.guilds.fetch(guildId);
  const members = await guild.members
    .fetch()
    .then(members => Array.from(members.values()));
  const memberUpdates = members.map(member => synchroniseMember(member));
  const notPresent = prisma.user.updateMany({
    where: { id: { notIn: members.map(m => m.user.id) } },
    data: { present: false },
  });

  await prisma.$transaction([...memberUpdates, notPresent]);

  logger.info`Database synchronised!`;
}

/**
 * Synchronises a member's data in the database.
 */
export function synchroniseMember(
  { user: { id, username } }: GuildMember | PartialGuildMember,
  present = true,
) {
  return prisma.user.upsert({
    where: { id },
    update: { username, present },
    create: { id, username, present },
  });
}
