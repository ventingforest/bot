import { GatewayIntentBits } from "discord.js";

import { guildId } from "$shared/data";
import prisma from "$shared/db";
import { ensureCorrectLevelRole, levelRoles } from "$shared/level";
import createClient from "$tools/client";

const client = await createClient({
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
	const guild = await client.guilds.fetch(guildId);
	const members = await guild.members.fetch();
	const db = await prisma.user.findMany({
		where: { id: { in: members.map(m => m.user.id) } },
	});

	// cache all role names for logging
	const roleNameCache = new Map<string, string>();
	const roleFetchPromises = levelRoles.map(async roleInfo => {
		const role =
			guild.roles.cache.get(roleInfo.id) ??
			(await guild.roles.fetch(roleInfo.id));
		if (role) roleNameCache.set(roleInfo.id, role.name);
	});
	await Promise.all(roleFetchPromises);

	await Promise.all(
		members.map(async member => {
			const user = db.find(u => u.id === member.user.id);
			const { oldId, newId } = await ensureCorrectLevelRole(
				member,
				user?.xp ?? 0,
			);
			if (oldId) {
				const oldRoleName = roleNameCache.get(oldId);
				const newRoleName = roleNameCache.get(newId);
				console.log(
					`${member.user.username} (${member.user.id}): ${oldRoleName} -> ${newRoleName}`,
				);
			}
		}),
	);

	console.log("done!");
	await client.destroy();
});
