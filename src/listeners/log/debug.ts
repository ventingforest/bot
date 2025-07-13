import { Listener } from "@sapphire/framework";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["discord"]);

export class DebugListener extends Listener<"debug"> {
  override run(message: string) {
    logger.debug(message);
  }
}
