import { readFile as read } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { decode } from "@msgpack/msgpack";

export type MessageData = {
	id: string;
	authorId: string;
	channelId: string;
	time: number;
	length: number;
};

export const messagePath = join(
	dirname(fileURLToPath(import.meta.url)),
	"messages.dat",
);

export async function readFile(): Promise<MessageData[]> {
	try {
		const file = await read(messagePath);
		return (decode(file) ?? []) as MessageData[];
	} catch {
		return [];
	}
}
