import type { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

export { Events, Listener } from "@sapphire/framework";

/**
 * {@link ApplyOptions} wrapper for the {@link Listener} class.
 */
export function Config<E extends (typeof Events)[keyof typeof Events]>(
  event: E,
  options?: Omit<Listener.Options, "event">,
) {
  return ApplyOptions<Listener.Options>({
    event,
    ...options,
  });
}
