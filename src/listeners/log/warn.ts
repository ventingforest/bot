import { getLogger } from "@logtape/logtape";
import { Events, Listener, config } from "$listener";

const logger = getLogger("api");

@config(Events.Warn)
export class Warn extends Listener<typeof Events.Warn> {
	override run(message: string) {
		logger.warn(message);
	}
}
