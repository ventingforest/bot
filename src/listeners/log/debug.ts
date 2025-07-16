import { Events, Listener, Config } from "$lib/listener";
import { getLogger } from "@logtape/logtape";

const logger = getLogger("discord");

@Config(Events.Debug)
export class Debug extends Listener<typeof Events.Debug> {
  override run(message: string) {
    logger.debug(message);
  }
}
