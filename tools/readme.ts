import { writeFile } from "node:fs/promises";

import {
	type ChatInputCommandInteraction,
	GatewayIntentBits,
} from "discord.js";

import { drawLevel } from "$commands/level";
import PrettyLeaderboard from "$lib/leaderboard/pretty";
import { guildId } from "$shared/data";
import prisma from "$shared/db";
import createClient from "$tools/client";

const users = await prisma.user.findMany({
	where: { present: true },
});

const client = await createClient({ intents: [GatewayIntentBits.Guilds] });
const userId = "326767126406889473";

client.on("ready", async () => {
	const guild = await client.guilds.fetch(guildId);

	// level
	const member = await guild.members.fetch(userId);
	const user = users.find(u => u.id === userId)!;
	const levelData = await drawLevel(member, guild, user, users);
	await writeFile("assets/level.webp", levelData);

	// leaderboard
	const leaderboard = new PrettyLeaderboard(
		users,
		{
			guild,
			user,
		} as unknown as ChatInputCommandInteraction,
		true,
	);
	const leaderboardData = await leaderboard.draw(1);
	await writeFile("assets/leaderboard.webp", leaderboardData);

	await client.destroy();
});
