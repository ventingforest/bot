import { PrismaClient } from "./generated/prisma";
import { getLogger } from "@logtape/logtape";
import { client, logger } from "$ctx";
import { guildId } from "$const";

export const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
});
const prismaLogger = getLogger(["prisma"]);
prisma.$on("info" as never, e => prismaLogger.info(e));
prisma.$on("warn" as never, e => prismaLogger.warn(e));
prisma.$on("error" as never, e => prismaLogger.error(e));

/**
 * Synchronises the database with the current state of the guild.
 */
export async function synchronise() {
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
