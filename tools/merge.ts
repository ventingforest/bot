import { GatewayIntentBits } from "discord.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { guildId } from "$shared/data";
import prisma from "$shared/db";
import { ensureCorrectLevelRole } from "$shared/level";
import createClient from "$tools/client";

// collect args
let {
	_: [toId, fromId], // reversed order
} = yargs(hideBin(process.argv))
	.usage("Usage: $0 <to> <from>") // update usage
	.number("to")
	.number("from")
	.demandCommand(2, "You must provide both <to> and <from> user IDs.")
	.help()
	.parseSync();

if (!toId || !fromId) {
	throw new Error("Error: Both <to> and <from> user IDs are required.");
}

toId = toId.toString();
fromId = fromId.toString();

// fetch data
const users = await prisma.user.findMany({
	select: { id: true, xp: true },
	where: { id: { in: [toId, fromId] } },
});
const toUser = users.find(u => u.id === toId)!;
const fromUser = users.find(u => u.id === fromId)!;

// new xp
const xp = fromUser.xp + toUser.xp;
await prisma.user.update({
	data: { xp },
	where: { id: toId },
});

// delete fromUser
await prisma.user.update({ data: { xp: 0 }, where: { id: fromId } });

// apply new level role
const client = await createClient({
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
	const guild = await client.guilds.fetch(guildId);
	const fromMember = await guild.members.fetch(fromId);
	const toMember = await guild.members.fetch(toId);

	await Promise.all([
		ensureCorrectLevelRole(fromMember, 0),
		ensureCorrectLevelRole(toMember, xp),
	]);

	await client.destroy();
});
