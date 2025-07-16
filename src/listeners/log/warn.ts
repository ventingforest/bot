import { Events, Listener, Config } from "$lib/listener";
import { getLogger } from "@logtape/logtape";

const logger = getLogger("discord");

@Config(Events.Warn)
export class Warn extends Listener<typeof Events.Warn> {
  override run(message: string) {
    logger.warn(message);
  }
}
