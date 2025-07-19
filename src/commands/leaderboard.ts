import {
  GuildMember,
  MessageFlags,
  User,
  type ChatInputCommandInteraction,
} from "discord.js";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import type { ChatInputCommand } from "@sapphire/framework";
import { c, drawAvatar, scale } from "$lib/level/canvas";
import { ChatInput, Config } from "$lib/command";
import type { User as DbUser } from "$prisma";
import { pageLength } from "$lib/level";

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
    ctx.fillStyle = c.mantle.hex;
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
  user: DbUser,
  y: number,
) {
  await drawAvatar(ctx, member, {
    x: avatarRadius * 2,
    y,
    radius: avatarRadius,
  });
}
