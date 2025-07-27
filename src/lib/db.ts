/* eslint-disable @typescript-eslint/promise-function-async */

import { getLogger } from "@logtape/logtape";
import { container } from "@sapphire/framework";
import type { GuildMember, PartialGuildMember } from "discord.js";

import { guildId } from "$lib/data";
import type { PrismaClient } from "$prisma";
import prisma from "$shared/db";

container.db = prisma;

// log prisma events
{
	const logger = getLogger("db");
	prisma.$on("info", ({ message }) => {
		logger.info(message);
	});
	prisma.$on("warn", ({ message }) => {
		logger.warn(message);
	});
	prisma.$on("error", ({ message }) => {
		logger.error(message);
	});
}

/**
 * Synchronises the database with the current state of the guild.
 */
export async function synchroniseGuild() {
	const guild = await container.client.guilds.fetch(guildId);
	const fetchedMembers = await guild.members.fetch();
	const members = [...fetchedMembers.values()];
	const memberUpdates = members.map(member => synchroniseMember(member));
	const notPresent = prisma.user.updateMany({
		data: { present: false },
		where: { id: { notIn: members.map(m => m.user.id) } },
	});

	await prisma.$transaction([...memberUpdates, notPresent]);
}

/**
 * Synchronises a member's data in the database.
 */
export function synchroniseMember(
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
