import {
	type Config,
	configure as configureLogger,
	getConsoleSink,
} from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { merge } from "ts-deepmerge";

export default async function configure<
	SinkId extends string,
	FilterId extends string,
>(...configs: Array<Partial<Config<SinkId, FilterId>>>) {
	const config = merge(...configs, {
		// disable logtape meta logger
		loggers: [
			{
				category: ["logtape", "meta"],
				lowestLevel: "warning",
				sinks: ["console"],
			},
		],
		// enable console sink
		sinks: {
			console: getConsoleSink({
				formatter: prettyFormatter,
			}),
		},
	}) as Config<SinkId, FilterId>;
	return configureLogger(config);
}
