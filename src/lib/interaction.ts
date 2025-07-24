import { type InteractionHandler } from "@sapphire/framework";

import { makeConfig, makeLoad } from "./internal";

export {
	InteractionHandler,
	InteractionHandlerTypes,
	type Option,
} from "@sapphire/framework";

/**
 * Configure a {@link InteractionHandler} piece.
 */
export const config = makeConfig<InteractionHandler.Options>(
	"interactionHandlerType",
);

/**
 * Load an {@link InteractionHandler} piece.
 */
export const load = makeLoad("interaction-handlers");
