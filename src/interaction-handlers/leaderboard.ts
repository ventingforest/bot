import {
  Config,
  InteractionHandler,
  InteractionHandlerTypes,
  type Option,
} from "$lib/handler";
import { type ButtonInteraction } from "discord.js";
import { getPage } from "src/commands/leaderboard";

interface Props {
  page: number;
  current: boolean;
}

@Config(InteractionHandlerTypes.Button)
export class Leaderboard extends InteractionHandler {
  override parse(interaction: ButtonInteraction): Option<Props> {
    const match = /lb_go_([0-9]+)_(true|false)/.exec(interaction.customId);
    if (!match) return this.none();
    const page = Number(match[1]);
    const current = match[2] === "true";
    return this.some({ page, current });
  }

  override async run(interaction: ButtonInteraction, { page, current }: Props) {
    await interaction.update(await getPage(interaction, current, page));
  }
}
