import { ApplyOptions } from "@sapphire/decorators";
import {
	type InteractionHandler,
	type InteractionHandlerTypes,
} from "@sapphire/framework";

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
