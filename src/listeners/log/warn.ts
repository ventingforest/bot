import { Listener } from "@sapphire/framework";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["discord"]);

export class WarnListener extends Listener<"warn"> {
  override run(message: string) {
    logger.warn(message);
  }
}
