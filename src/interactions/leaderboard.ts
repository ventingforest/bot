import { type ButtonInteraction } from "discord.js";

import { getPage } from "$commands/leaderboard";
import {
	config,
	InteractionHandler,
	InteractionHandlerTypes,
	load,
	type Option,
} from "$lib/interaction";

export type Props = {
	page: number;
	present: boolean;
	pretty: boolean;
};

@config(InteractionHandlerTypes.Button)
class Leaderboard extends InteractionHandler {
	override parse(interaction: ButtonInteraction): Option<Props> {
		console.log(interaction.customId);
		const match = /lb_(go|jmp|usr)_(\d+)_(true|false)(_pretty)?/.exec(
			interaction.customId,
		);
		if (!match) return this.none();
		const page = Number(match[2]);
		const present = match[3] === "true";
		const pretty = Boolean(match[4]);
		console.log(match);
		return this.some({ page, present, pretty });
	}

	override async run(interaction: ButtonInteraction, props: Props) {
		await interaction.update(await getPage(interaction, props));
	}
}

await load(Leaderboard);
