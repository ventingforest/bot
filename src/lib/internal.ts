import { ApplyOptions } from "@sapphire/decorators";
import {
	container,
	type PieceOptions,
	type Store,
	type StoreRegistryEntries,
	type StoreRegistryKey,
} from "@sapphire/framework";
import type { Constructor } from "@sapphire/utilities";

export function makeConfig<Options extends PieceOptions>(key: keyof Options) {
	function config(
		value: Options[typeof key],
		options?: Omit<Options, typeof key>,
	) {
		// eslint-disable-next-line new-cap
		return ApplyOptions<Options>({
			[key]: value,
			...options,
		} as Options);
	}

	return config;
}

/**
 * Create a function to load a piece into the specified store.
 */
export function makeLoad<StoreName extends StoreRegistryKey>(store: StoreName) {
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
