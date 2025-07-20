import fs from "node:fs/promises";
import {
	configure,
	fromAsyncSink,
	getConsoleSink,
	getLogger,
} from "@logtape/logtape";
import { getPrettyFormatter, prettyFormatter } from "@logtape/pretty";
import type { GuildTextBasedChannel } from "discord.js";
import { container } from "@sapphire/framework";
import { getFileSink } from "@logtape/file";

let logChannel: GuildTextBasedChannel;

const logFileSink = (name: string) =>
	getFileSink(`logs/${name}.log`, {
		bufferSize: 8192,
		flushInterval: 5000,
		formatter: getPrettyFormatter({ align: false, colors: false }),
		lazy: true,
		nonBlocking: true,
	});

const isProduction = process.env.NODE_ENV === "production";
const isTool = (process.argv[1] ?? "").includes("tools");
const logToDiscord = !isTool && isProduction && process.env.LOG_CHANNEL_ID;

// make sure the logs directory exists
if (isProduction && !(await fs.exists("logs"))) await fs.mkdir("logs");

await configure({
	loggers: [
		{
			category: "bot",
			lowestLevel: "debug",
			sinks: [
				"console",
				...(isProduction ? ["botFile"] : []),
				...(logToDiscord ? ["discord"] : []),
			],
		},
		{
			category: "db",
			lowestLevel: "info",
			sinks: ["console", ...(isProduction ? ["dbFile"] : [])],
		},
		{
			category: "api",
			lowestLevel: "debug",
			sinks: ["console", ...(isProduction ? ["apiFile"] : [])],
		},
		{
			category: ["logtape", "meta"],
			lowestLevel: "warning",
			sinks: ["console"],
		},
	],
	sinks: {
		console: getConsoleSink({
			formatter: prettyFormatter,
		}),
		...(logToDiscord && {
			discord: fromAsyncSink(async record => {
				logChannel ||= (await container.client.channels.fetch(
					process.env.LOG_CHANNEL_ID!,
				)) as GuildTextBasedChannel;

				await logChannel.send(`**${record.level}**: ${String(record.message)}`);
			}),
		}),
		...(isProduction && {
			apiFile: logFileSink("api"),
			botFile: logFileSink("bot"),
			dbFile: logFileSink("db"),
		}),
	},
});

const logger = getLogger("bot");
export default logger;
