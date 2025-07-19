import {
  GuildMember,
  MessageFlags,
  User,
  type ChatInputCommandInteraction,
} from "discord.js";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import type { ChatInputCommand } from "@sapphire/framework";
import { calculateLevel, pageLength } from "$lib/level";
import { c, drawText, scale } from "$lib/level/canvas";
import { drawAvatar } from "$lib/level/canvas/avatar";
import { ChatInput, Config } from "$lib/command";
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
    const maxPage = Math.max(1, Math.ceil(totalUsers / pageLength));

    if (page < 1 || page > maxPage) {
      await interaction.reply({
        content: `Page ${page} does not exist. Please choose a page between 1 and ${maxPage}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // fetch the users that appear on the page
    const userRows = await this.container.db.user.findMany({
      where,
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

    for (const db of userRows) {
      if (db.present) {
        await drawUser(
          ctx,
          await interaction.guild?.members.fetch(db.id)!,
          db,
          y,
        );
      } else {
        await drawUser(
          ctx,
          await this.container.client.users.fetch(db.id),
          db,
          y,
        );
      }
      y += dy;
    }

    // send
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      files: [
        {
          attachment: await canvas.toBuffer("webp"),
          name: `page-${page}.webp`,
        },
      ],
    });
  }
}

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
  // avatar
  let x = avatarRadius * 2;

  await drawAvatar(ctx, member, {
    x,
    y,
    radius: avatarRadius,
  });

  // username
  const user = member instanceof GuildMember ? member.user : member;
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
    4,
  );
}
