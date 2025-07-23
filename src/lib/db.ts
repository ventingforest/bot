import { container } from "@sapphire/framework";
import type { GuildMember, PartialGuildMember } from "discord.js";

import { guildId } from "$lib/data";
import type { PrismaClient } from "$prisma";
import prisma from "$shared/db";

const { client, logger } = container;
container.db = prisma;

/**
 * Synchronises the database with the current state of the guild.
 */
export async function synchroniseGuild() {
	logger.info(`Synchronising database with current guild state...`);

	const guild = await client.guilds.fetch(guildId);
	const fetchedMembers = await guild.members.fetch();
	const members = [...fetchedMembers.values()];
	const memberUpdates = members.map(async member => synchroniseMember(member));
	const notPresent = prisma.user.updateMany({
		data: { present: false },
		where: { id: { notIn: members.map(m => m.user.id) } },
	});

	await prisma.$transaction([...memberUpdates, notPresent]);

	logger.info(`Database synchronised!`);
}

/**
 * Synchronises a member's data in the database.
 */
export async function synchroniseMember(
	{ user: { id, username } }: GuildMember | PartialGuildMember,
	present = true,
) {
	return prisma.user.upsert({
		create: { id, present, username },
		update: { present, username },
		where: { id },
	});
}

declare module "@sapphire/pieces" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Container {
		db: PrismaClient;
	}
}
