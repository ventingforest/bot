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
    const match = /lb_go_([0-9]+)_(true|false)(_pretty)?/.exec(
      interaction.customId,
    );
    if (!match) return this.none();
    const page = Number(match[1]);
    const current = match[2] === "true";
    const pretty = Boolean(match[3]);
    return this.some({ page, current, pretty });
  }

  override async run(interaction: ButtonInteraction, props: Props) {
    await interaction.update(await getPage(interaction, props));
  }
}
