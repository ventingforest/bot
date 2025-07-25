import { type ChildProcess, spawn } from "node:child_process";

import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { watch } from "chokidar";
import { onExit } from "signal-exit";

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

function killBun() {
	if (bun && !bun.killed) {
		logger.info("killing previous bun process");
		bun.kill();
	}

	bun = undefined;
}

function startBun() {
	killBun();
	logger.info("starting bun process");
	bun = spawn("bun", ["run", "--silent", "start"], { stdio: "inherit" });
	bun.on("exit", code => {
		if (code) logger.error(`bun exited with code ${code}`);
		bun = undefined;
	});
}

watcher.on("change", path => {
	logger.info(`file changed: ${path}`);
	startBun();
});

startBun();
onExit(killBun);
