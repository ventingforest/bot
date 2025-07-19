import {
  InteractionHandler,
  type InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

export {
  InteractionHandlerTypes,
  InteractionHandler,
  type Option,
} from "@sapphire/framework";

export function Config(
  type: InteractionHandlerTypes,
  options: Omit<
    InteractionHandler.Options,
    "interactionHandlerType" | "ids"
  > = {},
) {
  return ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: type,
    ...options,
  });
}
