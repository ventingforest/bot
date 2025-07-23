import { getLogger } from "@logtape/logtape";

import { config, Events, Listener } from "$listener";

const logger = getLogger("api");

@config(Events.Warn)
export default class Warn extends Listener<typeof Events.Warn> {
	override run(message: string) {
		logger.warn(message);
	}
}
