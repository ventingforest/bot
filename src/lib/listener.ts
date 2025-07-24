import { ApplyOptions } from "@sapphire/decorators";
import type { Events, Listener } from "@sapphire/framework";

import makeLoad from "$lib/load";

export { Events, Listener } from "@sapphire/framework";

/**
 * {@link ApplyOptions} wrapper for the {@link Listener} class.
 */
export function config<E extends (typeof Events)[keyof typeof Events]>(
	event: E,
	options?: Omit<Listener.Options, "event">,
) {
	// eslint-disable-next-line new-cap
	return ApplyOptions<Listener.Options>({
		event,
		...options,
	});
}

/**
 * Load a {@link Listener} piece.
 */
export const load = makeLoad("listeners");
