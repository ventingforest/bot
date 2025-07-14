import { Listener } from "@sapphire/framework";
import { getLogger } from "@logtape/logtape";

const event = "warn";
const logger = getLogger(["discord"]);

export class WarnListener extends Listener<typeof event> {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event,
    });
  }

  override run(message: string) {
    logger.warn(message);
  }
}
