import { getLogger } from "@logtape/logtape";

import { config, Events, Listener } from "$listener";

const logger = getLogger("api");

@config(Events.Error)
export class ErrorListener extends Listener<typeof Events.Error> {
	override run(error: Error) {
		logger.error(error.message, { stack: error.stack });
	}
}
