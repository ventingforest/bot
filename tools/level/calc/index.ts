import prisma from "$shared/db";
import { getXpValue } from "$shared/level";

import { readFile } from "./lib";

// compute xp
const totalXp = new Map<string, number>(); // author id: xp
const messages = await readFile();

for (const { authorId, length } of messages) {
	const xp = getXpValue(length);
	totalXp.set(authorId, (totalXp.get(authorId) ?? 0) + xp);
}

// write to database
await prisma.$transaction(
	// eslint-disable-next-line @typescript-eslint/promise-function-async
	[...totalXp.entries()].map(([authorId, xp]) =>
		prisma.user.upsert({
			create: { id: authorId, xp },
			update: { xp: { increment: xp } },
			where: { id: authorId },
		}),
	),
);
