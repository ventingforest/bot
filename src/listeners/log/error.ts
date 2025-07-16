import { Events, Listener, Config } from "$lib/listener";
import { getLogger } from "@logtape/logtape";

const logger = getLogger("discord");

@Config(Events.Error)
export class ErrorListener extends Listener<typeof Events.Error> {
  override run(error: Error) {
    logger.error(error.message, { stack: error.stack });
  }
}
