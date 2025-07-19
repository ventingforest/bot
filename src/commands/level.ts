import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { drawAvatar, type AvatarData } from "$lib/level/canvas/avatar";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import { c, drawText, statusColours } from "$lib/level/canvas";
import type { ChatInputCommand } from "@sapphire/framework";
import { calculateLevel, rankInGuild } from "$lib/level";
import { ChatInput, Config } from "$lib/command";

@Config(
  {
    name: "level",
    description: "Check your current level",
    idHints: ["1395199921052975185"],
  },
  builder => {
    builder.addUserOption(option =>
      option
        .setName("user")
        .setDescription("the user to check the level of")
        .setRequired(false),
    );
  },
)
export class Level extends ChatInput {
  override async chatInputRun(
    interaction: ChatInputCommandInteraction,
    _: ChatInputCommand.RunContext,
  ) {
    const user = interaction.options.getUser("user") || interaction.user;

    // don't allow bots
    if (user.bot) {
      return interaction.reply({
        content: "bots don't have levels! please choose a person.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.guild?.members.cache.get(user.id)!;
    const dbUser = (await this.container.db.user.findUnique({
      where: { id: user.id },
    }))!;

    // create the canvas
    const canvas = new Canvas(500 * scale, 144 * scale);
    const ctx = canvas.getContext("2d");

    // background with border
    ctx.fillStyle = c.mantle.hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = c.base.hex;
    const border = 12 * scale;
    ctx.fillRect(
      border,
      border,
      canvas.width - border * 2,
      canvas.height - border * 2,
    );

    // avatar
    const level = calculateLevel(dbUser.xp);
    await drawAvatar(ctx, member, avatarData, {
      text: level.toString(),
      font: `800 ${18 * scale}px Nunito, sans-serif`,
      ...levelBox,
    });

    // username
    drawText(
      ctx,
      user.username,
      { x: avatarData.x + avatarData.r * 2, y: 20 * scale },
      `850 ${30 * scale}px Nunito, sans-serif`,
      c.text.hex,
      "left",
      "top",
    );

    // rank
    const rank = await rankInGuild(user);
    drawText(
      ctx,
      `Rank #${rank.toLocaleString()}`,
      { x: avatarData.x + avatarData.r * 2, y: 55 * scale },
      `600 ${14 * scale}px Nunito, sans-serif`,
      c.subtext0.hex,
      "left",
      "top",
    );

    // progress bar
    const stats = progressStats(dbUser);
    drawProgress(
      ctx,
      stats,
      {
        x: avatarData.x + avatarData.r * 2,
        y: avatarData.y + avatarData.r - levelBox.h,
      },
      300 * scale,
      18 * scale,
      `${stats.xpInLevel.toLocaleString()} / ${stats.xpNeeded.toLocaleString()} XP`,
    );

    // send
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      files: [
        {
          attachment: await canvas.toBuffer("webp"),
          name: `${user.username}.webp`,
        },
      ],
    });
  }
}

const scale = 3;

const avatarData: AvatarData = {
  x: 72 * scale,
  y: 72 * scale,
  r: 48 * scale,
};

const levelBox = {
  w: 40 * scale,
  h: 24 * scale,
};
