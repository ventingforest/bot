import { getLogger } from "@logtape/logtape";
import { Events, Listener, config } from "$listener";

const logger = getLogger("api");

@config(Events.Debug)
export class Debug extends Listener<typeof Events.Debug> {
	override run(message: string) {
		logger.debug(message);
	}
}
