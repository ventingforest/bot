import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  MessageFlags,
  User,
  type ChatInputCommandInteraction,
  type Interaction,
  type InteractionReplyOptions,
  type InteractionUpdateOptions,
} from "discord.js";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { container, type ChatInputCommand } from "@sapphire/framework";
import { calculateLevel, pageLength, rankInGuild } from "$lib/level";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import { drawAvatar } from "$lib/level/canvas/avatar";
import { ChatInput, Config } from "$lib/command";
import { c, drawText } from "$lib/level/canvas";
import type { User as DbUser } from "$prisma";

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
    // parse options
    const page = interaction.options.getNumber("page") ?? 1;
    const current = interaction.options.getBoolean("current") ?? true;

    // make sure the requested page is valid
    const maxPage = await findMaxPage(current);
    if (page < 1 || page > maxPage) {
      await interaction.reply({
        content: `Page ${page} does not exist. Please choose a page between 1 and ${maxPage}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // send
    await interaction.reply({
      ...(await getPage(interaction, current, page, maxPage)),
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function findMaxPage(current: boolean): Promise<number> {
  const totalUsers = await container.db.user.count({
    where: current ? { present: true } : undefined,
  });
  return Math.max(1, Math.ceil(totalUsers / pageLength));
}

export async function getPage(
  interaction: Interaction,
  current: boolean,
  page: number,
  maxPage?: number,
) {
  maxPage = maxPage ?? (await findMaxPage(current));

  // fetch the users that appear on the page
  const rows = await container.db.user.findMany({
    where: current ? { present: true } : undefined,
    orderBy: { xp: "desc" },
    skip: (page - 1) * pageLength,
    take: pageLength,
  });

  // create the canvas
  const canvas = new Canvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");
  let y = userHeight;

  // background
  ctx.fillStyle = c.base.hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // users
  for (const db of rows) {
    if (db.present) {
      await drawUser(
        ctx,
        await interaction.guild?.members.fetch(db.id)!,
        db,
        y,
      );
    } else {
      await drawUser(ctx, await container.client.users.fetch(db.id), db, y);
    }
    y += dy;
  }

  // buttons for pagination
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`lb_go_${page - 1}_${current}`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId("lb_current")
      .setLabel(`Page ${page} of ${maxPage}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`lb_go_${page + 1}_${current}`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= maxPage),
  );

  return {
    files: [
      {
        attachment: await canvas.toBuffer("webp"),
        name: `page-${page}.webp`,
      },
    ],
    components: [row],
  };
}

const scale = 4;
const canvasWidth = 50 * pageLength * scale;

const avatarRadius = canvasWidth / (pageLength * 4);
const userSpacing = avatarRadius / 2;
const userHeight = avatarRadius * 2 + userSpacing + avatarRadius / 8;

const canvasHeight = userHeight * (pageLength + 1);
const dy = userHeight;

async function drawUser(
  ctx: CanvasRenderingContext2D,
  member: GuildMember | User,
  db: DbUser,
  y: number,
) {
  const user = member instanceof GuildMember ? member.user : member;
  let x = avatarRadius * 2;

  // avatar
  const rank = await rankInGuild(user);
  let medalColour = undefined;

  switch (rank) {
    case 1:
      medalColour = c.yellow.hex;
      break;
    case 2:
      medalColour = c.subtext1.hex;
      break;
    case 3:
      medalColour = c.peach.hex;
      break;
  }

  await drawAvatar(
    ctx,
    member,
    {
      x,
      y,
      r: avatarRadius,
      borderColour: medalColour,
    },
    {
      text: `#${rank}`,
      font: `700 ${5 * scale}px Nunito, sans-serif`,
      w: 12 * scale,
      h: 8 * scale,
      bgColour: medalColour,
    },
  );

  // username
  x += avatarRadius * 2;
  const usernameY = y - avatarRadius / 2;
  drawText(
    ctx,
    user.username,
    { x, y: usernameY },
    `850 ${8 * scale}px Nunito, sans-serif`,
  );

  // level
  drawText(
    ctx,
    `Level ${calculateLevel(db.xp)}`,
    { x, y: y + scale },
    `600 ${6 * scale}px Nunito, sans-serif`,
    c.subtext0.hex,
  );

  // progress bar
  const stats = progressStats(db);
  drawProgress(
    ctx,
    stats,
    { x, y: y + avatarRadius / 3 },
    canvasWidth - x - avatarRadius * 2,
    avatarRadius / 2,
    `${((stats.xpInLevel / stats.xpNeeded) * 100).toFixed(2)}%`,
    4 * scale,
  );
}
