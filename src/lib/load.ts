import {
	container,
	type Store,
	type StoreRegistryEntries,
	type StoreRegistryKey,
} from "@sapphire/framework";
import type { Constructor } from "@sapphire/utilities";

/**
 * Create a function to load a piece into the specified store.
 */
export default function makeLoad<StoreName extends StoreRegistryKey>(
	store: StoreName,
) {
	async function load(
		piece: StoreRegistryEntries[StoreName] extends Store<infer Piece>
			? Constructor<Piece>
			: never,
	) {
		await container.stores.loadPiece({
			name: piece.name,
			piece,
			store,
		});
	}

	return load;
}
