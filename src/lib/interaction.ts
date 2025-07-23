import { ApplyOptions } from "@sapphire/decorators";
import {
	type InteractionHandler,
	type InteractionHandlerTypes,
} from "@sapphire/framework";

import makeLoad from "./load";

export {
	InteractionHandler,
	InteractionHandlerTypes,
	type Option,
} from "@sapphire/framework";

export function config(
	type: InteractionHandlerTypes,
	options: Omit<
		InteractionHandler.Options,
		"interactionHandlerType" | "ids"
	> = {},
) {
	// eslint-disable-next-line new-cap
	return ApplyOptions<InteractionHandler.Options>({
		interactionHandlerType: type,
		...options,
	});
}

/**
 * Load an {@link InteractionHandler} piece.
 */
export const load = makeLoad("interaction-handlers");
