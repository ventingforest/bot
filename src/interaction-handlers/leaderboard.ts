import { type ButtonInteraction } from "discord.js";

import { getPage } from "$commands/leaderboard";
import {
	config,
	InteractionHandler,
	InteractionHandlerTypes,
	type Option,
} from "$interaction";

export type Props = {
	page: number;
	current: boolean;
	pretty: boolean;
};

@config(InteractionHandlerTypes.Button)
export class Leaderboard extends InteractionHandler {
	override parse(interaction: ButtonInteraction): Option<Props> {
		const match = /lb_(go|jmp)_(\d+)_(true|false)(_pretty)?/.exec(
			interaction.customId,
		);
		if (!match) return this.none();
		const page = Number(match[2]);
		const current = match[3] === "true";
		const pretty = Boolean(match[3]);
		return this.some({ current, page, pretty });
	}

	override async run(interaction: ButtonInteraction, props: Props) {
		await interaction.update(await getPage(interaction, props));
	}
}
