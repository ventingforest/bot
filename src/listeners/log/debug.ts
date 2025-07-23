import { getLogger } from "@logtape/logtape";

import { config, Events, Listener } from "$listener";

const logger = getLogger("api");

@config(Events.Debug)
export default class Debug extends Listener<typeof Events.Debug> {
	override run(message: string) {
		logger.debug(message);
	}
}
