import { Listener } from "@sapphire/framework";
import { getLogger } from "@logtape/logtape";

const event = "debug";
const logger = getLogger(["discord"]);

export class DebugListener extends Listener<typeof event> {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event,
    });
  }

  override run(message: string) {
    logger.debug(message);
  }
}
