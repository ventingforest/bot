import { Events, Listener, Config } from "$bot/listener";
import { getLogger } from "@logtape/logtape";

const logger = getLogger("api");

@Config(Events.Warn)
export class Warn extends Listener<typeof Events.Warn> {
  override run(message: string) {
    logger.warn(message);
  }
}
