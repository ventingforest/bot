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
	const names = new Map<string, string>();
	const fetches = levelRoles.map(async roleInfo => {
		const role = await guild.roles.fetch(roleInfo.id);
		if (role) names.set(roleInfo.id, role.name);
	});
	await Promise.all(fetches);

	// update
	const updates = members.map(async member => {
		const user = db.find(u => u.id === member.user.id);
		const { oldId, newId } = await ensureCorrectLevelRole(
			member,
			user?.xp ?? 0,
		);
		if (oldId) {
			const oldRoleName = names.get(oldId);
			const newRoleName = names.get(newId);
			console.log(
				`${member.user.username} (${member.user.id}): ${oldRoleName} -> ${newRoleName}`,
			);
		}
	});
	await Promise.all(updates);

	console.log("done!");
	await client.destroy();
});
