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
import { ChatInput, Config } from "$command";
import { getPrettyPage } from "./_pretty";
import { pageLength } from "$lib/level";
import { getTextPage } from "./_text";

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
      )
      .addBooleanOption(option =>
        option
          .setName("text")
          .setDescription(
            "use a text-only leaderboard instead of the graphical one",
          ),
      );
  },
)
export class Leaderboard extends ChatInput {
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
    const maxPage = await findMaxPage(
      props.current,
      pretty ? pageLength.pretty : pageLength.text,
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
      ...(await getPage(interaction, props, maxPage)),
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function getPage(
  interaction: Interaction,
  props: Props,
  maxPage?: number,
): Promise<Omit<InteractionUpdateOptions, "content">> {
  // fetch data
  const { page, current, pretty } = props;
  const length = pretty ? pageLength.pretty : pageLength.text;
  const users = await container.db.user.findMany({
    where: current ? { present: true } : undefined,
    orderBy: { xp: "desc" },
    skip: (page - 1) * length,
    take: length,
  });
  maxPage = maxPage || (await findMaxPage(current, length));

  // generate page
  let content: InteractionUpdateOptions;

  if (pretty) {
    content = await getPrettyPage(interaction, props, maxPage, users);
  } else {
    content = await getTextPage(props, maxPage, users);
  }

  // buttons for pagination
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`lb_go_${page - 1}_${current}${pretty ? "_pretty" : ""}`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId("lb_current")
      .setLabel(`Page ${page} of ${maxPage}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`lb_go_${page + 1}_${current}${pretty ? "_pretty" : ""}`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= maxPage),
  );

  return { components: [row], ...content };
}

async function findMaxPage(
  current: boolean,
  pageLength: number,
): Promise<number> {
  const totalUsers = await container.db.user.count({
    where: current ? { present: true } : undefined,
  });
  return Math.max(1, Math.ceil(totalUsers / pageLength));
}
