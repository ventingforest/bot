import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import prisma from "$shared/db";

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
await prisma.user.delete({ where: { id: fromId } });
