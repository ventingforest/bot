import fs from "node:fs/promises";

import {
	configure,
	fromAsyncSink,
	getConsoleSink,
	getLogger,
} from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { container } from "@sapphire/framework";
import type { GuildTextBasedChannel } from "discord.js";

import { isProduction } from "$lib/data";
import getLogFile from "$lib/logger/file";

// make sure the logs directory exists
if (isProduction && !(await fs.exists("logs"))) await fs.mkdir("logs");

// channel to log to
const logChannelId = "1395188130348269648";
let logChannel: GuildTextBasedChannel;

await configure({
	loggers: [
		{
			category: "bot",
			lowestLevel: "debug",
			sinks: ["console", ...(isProduction ? ["botFile", "discord"] : [])],
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
		...(isProduction && {
			discord: fromAsyncSink(async record => {
				const fetchedChannel =
					await container.client.channels.fetch(logChannelId);
				logChannel ||= fetchedChannel as GuildTextBasedChannel;

				await logChannel.send(`**${record.level}**: ${String(record.message)}`);
			}),
		}),
		...(isProduction && {
			apiFile: getLogFile("api"),
			botFile: getLogFile("bot"),
			dbFile: getLogFile("db"),
		}),
	},
});

const logger = getLogger("bot");
export default logger;
