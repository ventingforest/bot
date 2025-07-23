import { getLogger } from "@logtape/logtape";

import { config, Events, Listener, load } from "$listener";

const logger = getLogger("api");

@config(Events.Warn)
class Warn extends Listener<typeof Events.Warn> {
	override run(message: string) {
		logger.warn(message);
	}
}

await load(Warn);
