import {
  MessageFlags,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { ChatInputCommand } from "@sapphire/framework";
import { ChatInput, Config } from "$lib/command";
import { levels } from "$lib/data";

@Config(
  {
    name: "leaderboard",
    description: "view the server leaderboard",
    idHints: ["1395903756121542799"],
  },
  builder => {
    builder
      .addNumberOption(option =>
        option
          .setName("page")
          .setDescription("the page of the leaderboard to start at")
          .setMinValue(1),
      )
      .addBooleanOption(option =>
        option
          .setName("current")
          .setDescription(
            "only show users that are currently members of the server",
          ),
      );
  },
)
export class Leaderboard extends ChatInput {
  override async chatInputRun(
    interaction: ChatInputCommandInteraction,
    _: ChatInputCommand.RunContext,
  ) {
    // todo: buttons for next/previous page

    // parse options
    const page = interaction.options.getNumber("page") ?? 1;
    const where =
      (interaction.options.getBoolean("current") ?? true)
        ? { present: true }
        : undefined;

    // count total users for pagination
    const totalUsers = await this.container.db.user.count({
      where,
    });
    const maxPage = Math.max(1, Math.ceil(totalUsers / levels.pageLength));

    if (page < 1 || page > maxPage) {
      await interaction.reply({
        content: `Page ${page} does not exist. Please choose a page between 1 and ${maxPage}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // fetch the users that appear on the page
    const users = await this.container.db.user.findMany({
      where,
      orderBy: { xp: "desc" },
      skip: (page - 1) * levels.pageLength,
      take: levels.pageLength,
    });
    console.log(users);
  }
}
