import { GatewayIntentBits } from "discord.js";

import { guildId } from "$shared/data";
import prisma from "$shared/db";
import { getLevelRole, levelForXp, levelRoles } from "$shared/level";
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
			const level = levelForXp(user?.xp ?? 0);
			const correctRoleId = getLevelRole(level);
			const promises = [];

			// remove old level roles
			let removedId: string | undefined;
			for (const role of levelRoles) {
				if (role.id !== correctRoleId && member.roles.cache.has(role.id)) {
					removedId = role.id;
					promises.push(member.roles.remove(role.id, "remove old level role"));
				}
			}

			// add new level roles
			if (correctRoleId && !member.roles.cache.has(correctRoleId)) {
				promises.push(member.roles.add(correctRoleId, "add new level role"));
			}

			await Promise.all(promises);
			const removedRoleName = removedId
				? roleNameCache.get(removedId)
				: undefined;
			const correctRoleName = correctRoleId
				? roleNameCache.get(correctRoleId)
				: undefined;
			if (removedRoleName)
				console.log(
					`${member.user.username}: ${removedRoleName} -> ${correctRoleName}`,
				);
		}),
	);

	console.log("done!");
	await client.destroy();
});
