import {
	type InteractionHandler,
	type InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

export {
	InteractionHandlerTypes,
	InteractionHandler,
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
