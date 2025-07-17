import {
  GuildMember,
  MessageFlags,
  type ChatInputCommandInteraction,
  type PresenceStatus,
} from "discord.js";
import {
  Canvas,
  FontLibrary,
  loadImage,
  type CanvasRenderingContext2D,
} from "skia-canvas";
import type { ChatInputCommand } from "@sapphire/framework";
import { ChatInput, Config } from "$lib/command";
import { flavors } from "@catppuccin/palette";
import node_modules from "node_modules-path";
import path from "path";

const scale = 3;
const {
  mocha: { colors: colours },
} = flavors;

FontLibrary.use("Nunito", [
  path.join(
    node_modules(),
    "@fontsource-variable",
    "nunito",
    "files",
    "nunito-latin-wght-normal.woff2",
  ),
]);

@Config({
  name: "level",
  description: "Check your current level",
  idHints: ["1395199921052975185"],
})
export class Level extends ChatInput {
  override async chatInputRun(
    interaction: ChatInputCommandInteraction,
    _: ChatInputCommand.RunContext,
  ) {
    const user = await this.container.db.user.findUnique({
      where: { id: interaction.user.id },
    });

    // create the canvas and load the avatar
    const canvas = new Canvas(500 * scale, 144 * scale),
      ctx = canvas.getContext("2d");
    const avatar = await loadImage(
      interaction.user.displayAvatarURL({ extension: "webp", size: 256 }),
    );

    // draw the background
    ctx.fillStyle = colours.mantle.hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colours.base.hex;
    const borderWidth = 12 * scale;
    ctx.fillRect(
      borderWidth,
      borderWidth,
      canvas.width - borderWidth * 2,
      canvas.height - borderWidth * 2,
    );

    // draw the avatar border based on status
    const avatarX = 72 * scale;
    const avatarY = 72 * scale;
    const avatarRadius = 48 * scale;
    const borderThickness = 6 * scale;
    const status =
      (interaction.member as GuildMember).presence?.status || "offline";
    const statusColors: Record<PresenceStatus, string> = {
      online: colours.green.hex,
      idle: colours.yellow.hex,
      dnd: colours.red.hex,
      offline: colours.overlay0.hex,
      invisible: colours.overlay0.hex,
    };
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX,
      avatarY,
      avatarRadius + borderThickness / 2,
      0,
      Math.PI * 2,
      true,
    );
    ctx.strokeStyle = statusColors[status] || statusColors.offline;
    ctx.lineWidth = borderThickness;
    ctx.stroke();
    ctx.restore();

    // draw the avatar in a circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.drawImage(
      avatar,
      avatarX - avatarRadius,
      avatarY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2,
    );
    ctx.restore();

    // display the level
    const boxWidth = 40 * scale;
    const boxHeight = 24 * scale;
    const boxX = avatarX + avatarRadius - (3 * boxWidth) / 4;
    const boxY = avatarY + avatarRadius - boxHeight;
    ctx.fillStyle = colours.mauve.hex;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    const currentLevel = calculateLevel(user?.xp ?? 0);
    ctx.font = `800 ${18 * scale}px Nunito, sans-serif`;
    ctx.fillStyle = colours.base.hex;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      currentLevel.toString(),
      boxX + boxWidth / 2,
      boxY + boxHeight / 2,
    );

    // username
    ctx.font = `850 ${30 * scale}px Nunito, sans-serif`;
    ctx.fillStyle = colours.text.hex;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(
      interaction.user.username,
      avatarX + avatarRadius * 2,
      20 * scale,
    );

    // progress bar
    const progressBarX = avatarX + avatarRadius * 2;
    const progressBarY = 86 * scale;
    const progressBarWidth = 300 * scale;
    const progressBarHeight = 18 * scale;
    const progressBarRadius = progressBarHeight / 2;
    const nextLevel = currentLevel + 1;
    const xpForCurrent = 120 * currentLevel ** 2;
    const xpForNext = 120 * nextLevel ** 2;
    const xpInLevel = (user?.xp ?? 0) - xpForCurrent;
    const xpNeeded = xpForNext - xpForCurrent;
    const progress = Math.max(0, Math.min(1, xpInLevel / xpNeeded));

    ctx.fillStyle = colours.surface0.hex;
    roundRect(
      ctx,
      progressBarX,
      progressBarY,
      progressBarWidth,
      progressBarHeight,
      progressBarRadius,
    );
    ctx.fill();
    ctx.save();
    roundRect(
      ctx,
      progressBarX,
      progressBarY,
      progressBarWidth,
      progressBarHeight,
      progressBarRadius,
    );
    ctx.clip();
    ctx.fillStyle = colours.green.hex;
    ctx.fillRect(
      progressBarX,
      progressBarY,
      progressBarWidth * progress,
      progressBarHeight,
    );
    ctx.restore();

    // draw xp text with dual color for visibility
    const xpText = `${xpInLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`;
    const xpTextX = progressBarX + progressBarWidth - 12 * scale;
    const xpTextY = progressBarY + progressBarHeight / 2;
    ctx.font = `600 ${13 * scale}px Nunito, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // draw text in bar color, clipped to filled part
    ctx.save();
    roundRect(
      ctx,
      progressBarX,
      progressBarY,
      progressBarWidth * progress,
      progressBarHeight,
      progressBarRadius,
    );
    ctx.clip();
    ctx.fillStyle = colours.base.hex;
    ctx.fillText(xpText, xpTextX, xpTextY);
    ctx.restore();

    // draw text in normal color, clipped to unfilled part
    ctx.save();
    roundRect(
      ctx,
      progressBarX + progressBarWidth * progress,
      progressBarY,
      progressBarWidth * (1 - progress),
      progressBarHeight,
      progressBarRadius,
    );
    ctx.clip();
    ctx.fillStyle = colours.text.hex;
    ctx.fillText(xpText, xpTextX, xpTextY);
    ctx.restore();

    // send
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      files: [
        {
          attachment: await canvas.toBuffer("webp"),
          name: `${interaction.user.username}.webp`,
        },
      ],
    });
  }
}

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 120));
}

function xpForLevel(level: number): number {
  return Math.floor(120 * level * level);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
