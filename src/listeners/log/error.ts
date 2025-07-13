import { Listener } from "@sapphire/framework";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["discord"]);

export class ErrorListener extends Listener<"error"> {
  override run(error: Error) {
    logger.error(error.message, { stack: error.stack });
  }
}
