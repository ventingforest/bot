import { getLogger } from "@logtape/logtape";

import { config, Events, Listener, load } from "$listener";

const logger = getLogger("api");

@config(Events.Debug)
class Debug extends Listener<typeof Events.Debug> {
	override run(message: string) {
		logger.debug(message);
	}
}

await load(Debug);
