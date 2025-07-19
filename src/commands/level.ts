import { scale, c, drawText, statusColours } from "$lib/level/canvas";
import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { drawAvatar, type CircleData } from "$lib/level/canvas/avatar";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import type { ChatInputCommand } from "@sapphire/framework";
import { calculateLevel, rankInServer } from "$lib/level";
import { ChatInput, Config } from "$lib/command";

const avatarData: CircleData = {
  x: 72 * scale,
  y: 72 * scale,
  radius: 48 * scale,
};

const levelBox = {
  w: 40 * scale,
  h: 24 * scale,
};

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
    const status = member.presence?.status || "offline";
    const colour = statusColours[status] || statusColours.offline;

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
    await drawAvatar(ctx, member, avatarData);

    // level box
    const level = calculateLevel(dbUser.xp);
    drawLevelBox(ctx, level, colour);

    // username
    drawText(
      ctx,
      user.username,
      { x: avatarData.x + avatarData.radius * 2, y: 20 * scale },
      `850 ${30 * scale}px Nunito, sans-serif`,
      c.text.hex,
      "left",
      "top",
    );

    // rank
    const rank = await rankInServer(user);
    drawText(
      ctx,
      `Rank #${rank.toLocaleString()}`,
      { x: avatarData.x + avatarData.radius * 2, y: 55 * scale },
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
        x: avatarData.x + avatarData.radius * 2,
        y: avatarData.y + avatarData.radius - levelBox.h,
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

function drawLevelBox(
  ctx: CanvasRenderingContext2D,
  level: number,
  colour: string,
) {
  const { x, y, radius } = avatarData;
  const { w, h } = levelBox;
  const boxX = x + radius - (3 * w) / 4;
  const boxY = y + radius - h;
  ctx.fillStyle = colour;
  ctx.fillRect(boxX, boxY, w, h);
  drawText(
    ctx,
    level.toString(),
    { x: boxX + w / 2, y: boxY + h / 2 },
    `800 ${18 * scale}px Nunito, sans-serif`,
    c.base.hex,
    "center",
    "middle",
  );
}
