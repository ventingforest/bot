import { type ChildProcess, spawn } from "node:child_process";

import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { watch } from "chokidar";

await configure({
	loggers: [
		{
			category: "watch",
			lowestLevel: "info",
			sinks: ["console"],
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
	},
});

const logger = getLogger("watch");
const watcher = watch(["src", "shared"], {
	ignored: /_load\.ts$/,
});

let bun: ChildProcess | undefined;

function startBun() {
	// kill the previous bun process if it exists
	if (bun) {
		bun.kill();
	}

	// start bun
	bun = spawn("bun", ["run", "--silent", "start"], { stdio: "inherit" });
	bun.on("exit", code => {
		if (code) logger.error(`bun exited with code ${code}`);
		bun = undefined;
	});
}

watcher.on("change", path => {
	logger.info(path);
	startBun();
});

startBun();
