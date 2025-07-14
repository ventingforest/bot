import { Listener } from "@sapphire/framework";
import { getLogger } from "@logtape/logtape";

const event = "error";
const logger = getLogger(["discord"]);

export class ErrorListener extends Listener<typeof event> {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event,
    });
  }
  override run(error: Error) {
    logger.error(error.message, { stack: error.stack });
  }
}
