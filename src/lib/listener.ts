import type { Listener } from "@sapphire/framework";

import { makeConfig, makeLoad } from "./internal";

export { Events, Listener } from "@sapphire/framework";

/**
 * Configure a {@link Listener} piece.
 */
export const config = makeConfig<Listener.Options>("event");

/**
 * Load a {@link Listener} piece.
 */
export const load = makeLoad("listeners");
