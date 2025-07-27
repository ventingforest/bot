import { type ButtonInteraction } from "discord.js";

import { activeLeaderboards } from "$commands/leaderboard";
import {
	config,
	InteractionHandler,
	InteractionHandlerTypes,
	load,
	type Option,
} from "$lib/interaction";

type Props = {
	interactionId: string;
	page: number;
};

@config(InteractionHandlerTypes.Button)
class Leaderboard extends InteractionHandler {
	override parse(interaction: ButtonInteraction): Option<Props> {
		const match = /lb_(\d+)_(go|jmp|usr)_(\d+)/.exec(interaction.customId);
		if (!match) return this.none();
		const interactionId = match[1]!;
		const page = Number(match[3]);
		return this.some({ interactionId, page });
	}

	override async run(
		interaction: ButtonInteraction,
		{ interactionId, page }: Props,
	) {
		// await interaction.deferUpdate();
		const leaderboard = activeLeaderboards.get(interactionId)!;
		await interaction.update(await leaderboard.render(page));
	}
}

await load(Leaderboard);
