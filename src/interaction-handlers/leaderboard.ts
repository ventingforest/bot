import {
  Config,
  InteractionHandler,
  InteractionHandlerTypes,
  type Option,
} from "$interaction";
import { type ButtonInteraction } from "discord.js";
import { getPage } from "$commands/leaderboard";

export interface Props {
  page: number;
  current: boolean;
  pretty: boolean;
}

@Config(InteractionHandlerTypes.Button)
export class Leaderboard extends InteractionHandler {
  override parse(interaction: ButtonInteraction): Option<Props> {
    const match = /lb_(go|jmp)_([0-9]+)_(true|false)(_pretty)?/.exec(
      interaction.customId,
    );
    if (!match) return this.none();
    const page = Number(match[2]);
    const current = match[3] === "true";
    const pretty = Boolean(match[3]);
    return this.some({ page, current, pretty });
  }

  override async run(interaction: ButtonInteraction, props: Props) {
    await interaction.update(await getPage(interaction, props));
  }
}
