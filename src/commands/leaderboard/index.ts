import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type ChatInputCommandInteraction,
  type Interaction,
  type InteractionUpdateOptions,
} from "discord.js";
import { container, type ChatInputCommand } from "@sapphire/framework";
import type { Props } from "$interactions/leaderboard";
import { Command, Config } from "$command";
import { getPrettyPage } from "./_pretty";
import { pageLength } from "$lib/level";
import { getTextPage } from "./_text";

@Config({
  slash: {
    name: "leaderboard",
    description: "view the server leaderboard",
    idHints: ["1396170991633301535"],
    options: builder => {
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
        )
        .addBooleanOption(option =>
          option
            .setName("text")
            .setDescription(
              "use a text-only leaderboard instead of the graphical one",
            ),
        );
    },
  },
})
export class Leaderboard extends Command {
  override async chatInputRun(
    interaction: ChatInputCommandInteraction,
    _: ChatInputCommand.RunContext,
  ) {
    // parse options
    const page = interaction.options.getNumber("page") ?? 1;
    const current = interaction.options.getBoolean("current") ?? true;
    const pretty = !interaction.options.getBoolean("text");

    // make sure the requested page is valid
    const props: Props = { current, pretty, page };
    const totalUsers = await container.db.user.count({
      where: current ? { present: true } : undefined,
    });
    const maxPage = Math.max(
      1,
      Math.ceil(totalUsers / (pretty ? pageLength.pretty : pageLength.text)),
    );
    if (page < 1 || page > maxPage) {
      await interaction.reply({
        content: `Page ${page} does not exist. Please choose a page between 1 and ${maxPage}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // send
    await interaction.reply({
      ...(await getPage(interaction, props)),
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function getPage(
  interaction: Interaction,
  props: Props,
): Promise<Omit<InteractionUpdateOptions, "content">> {
  // fetch data
  const { page, current, pretty } = props;
  const length = pretty ? pageLength.pretty : pageLength.text;
  const allUsers = await container.db.user.findMany({
    where: current ? { present: true } : undefined,
    orderBy: { xp: "desc" },
  });
  const pageUsers = allUsers.slice((page - 1) * length, page * length);
  const maxPage = Math.max(1, Math.ceil(allUsers.length / length));

  // generate page
  let content: InteractionUpdateOptions;

  if (pretty) {
    content = await getPrettyPage(interaction, page, allUsers, pageUsers);
  } else {
    content = await getTextPage(allUsers, pageUsers);
  }

  // buttons for pagination
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    // first page
    new ButtonBuilder()
      .setCustomId(`lb_jmp_1_${current}${pretty ? "_pretty" : ""}`)
      .setEmoji("⏮️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
    // previous page
    new ButtonBuilder()
      .setCustomId(`lb_go_${page - 1}_${current}${pretty ? "_pretty" : ""}`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    // current page
    new ButtonBuilder()
      .setCustomId("lb_current")
      .setLabel(`Page ${page} of ${maxPage}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    // next page
    new ButtonBuilder()
      .setCustomId(`lb_go_${page + 1}_${current}${pretty ? "_pretty" : ""}`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === maxPage),
    // last page
    new ButtonBuilder()
      .setCustomId(`lb_jmp_${maxPage}_${current}${pretty ? "_pretty" : ""}`)
      .setEmoji("⏭️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === maxPage),
  );

  return { components: [row], ...content };
}
