import { Events, Listener, Config } from "$bot/listener";
import { getLogger } from "@logtape/logtape";

const logger = getLogger("api");

@Config(Events.Debug)
export class Debug extends Listener<typeof Events.Debug> {
  override run(message: string) {
    logger.debug(message);
  }
}
