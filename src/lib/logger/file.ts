import { getFileSink } from "@logtape/file";
import { getPrettyFormatter } from "@logtape/pretty";

export default function getLogFile(name: string) {
	return getFileSink(`logs/${name}.log`, {
		bufferSize: 8192,
		flushInterval: 5000,
		formatter: getPrettyFormatter({ align: false, colors: false }),
		lazy: true,
		nonBlocking: true,
	});
}
