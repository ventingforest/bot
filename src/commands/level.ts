import {
  Canvas,
  FontLibrary,
  Image,
  loadImage,
  type CanvasRenderingContext2D,
  type CanvasTextAlign,
  type CanvasTextBaseline,
} from "skia-canvas";
import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type PresenceStatus,
} from "discord.js";
import { calculateLevel, rankInServer, xpForLevel } from "$lib/level";
import type { ChatInputCommand } from "@sapphire/framework";
import { ChatInput, Config } from "$lib/command";
import { flavors } from "@catppuccin/palette";
import node_modules from "node_modules-path";
import path from "path";

const scale = 3;
const {
  mocha: { colors: c },
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

const statusColours: Record<PresenceStatus, string> = {
  online: c.green.hex,
  idle: c.yellow.hex,
  dnd: c.red.hex,
  offline: c.overlay0.hex,
  invisible: c.overlay0.hex,
};

const avatarData = {
  x: 72 * scale,
  y: 72 * scale,
  radius: 48 * scale,
  border: 6 * scale,
};

const levelBox = {
  w: 40 * scale,
  h: 24 * scale,
};

const progressBar = {
  x: avatarData.x + avatarData.radius * 2,
  w: 300 * scale,
  h: 18 * scale,
  r: 9 * scale,
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
    const dbUser = await this.container.db.user.findUnique({
      where: { id: user.id },
    });

    const canvas = new Canvas(500 * scale, 144 * scale);
    const ctx = canvas.getContext("2d");
    const avatar = await loadImage(
      user.displayAvatarURL({ extension: "webp", size: 256 }),
    );
    const status = member.presence?.status || "offline";
    const colour = statusColours[status] || statusColours.offline;

    // background
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

    // avatar border
    drawCircle(
      ctx,
      avatarData.x,
      avatarData.y,
      avatarData.radius + avatarData.border / 2,
      colour,
      avatarData.border,
    );

    // avatar
    drawAvatar(ctx, avatar);

    // level box
    const level = calculateLevel(dbUser?.xp ?? 0);
    drawLevelBox(ctx, level, colour);

    // username
    drawText(
      ctx,
      user.username,
      avatarData.x + avatarData.radius * 2,
      20 * scale,
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
      avatarData.x + avatarData.radius * 2,
      55 * scale,
      `600 ${14 * scale}px Nunito, sans-serif`,
      c.subtext0.hex,
      "left",
      "top",
    );

    // progress bar
    const nextLevel = level + 1;
    const xpForCurrent = xpForLevel(level);
    const xpForNext = xpForLevel(nextLevel);
    const xpInLevel = (dbUser?.xp ?? 0) - xpForCurrent;
    const xpNeeded = xpForNext - xpForCurrent;
    const progress = Math.max(0, Math.min(1, xpInLevel / xpNeeded));

    drawProgressBar(ctx, progress, xpInLevel, xpNeeded);

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

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  lineWidth: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawAvatar(ctx: CanvasRenderingContext2D, avatar: Image) {
  const { x, y, radius } = avatarData;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
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
    boxX + w / 2,
    boxY + h / 2,
    `800 ${18 * scale}px Nunito, sans-serif`,
    c.base.hex,
    "center",
    "middle",
  );
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = "left",
  baseline: CanvasTextBaseline = "alphabetic",
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
}

function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  progress: number,
  xpInLevel: number,
  xpNeeded: number,
) {
  const { x, w, h, r } = progressBar;
  const y = avatarData.y + avatarData.radius - levelBox.h; // keep in line with level box
  ctx.fillStyle = c.surface0.hex;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();

  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = c.green.hex;
  ctx.fillRect(x, y, w * progress, h);
  ctx.restore();

  // xp text
  const xpText = `${xpInLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`;
  const textX = x + w - 12 * scale;
  const textY = y + h / 2;
  const font = `600 ${13 * scale}px Nunito, sans-serif`;

  // draw text in bar color (filled part)
  ctx.save();
  roundRect(ctx, x, y, w * progress, h, r);
  ctx.clip();
  drawText(ctx, xpText, textX, textY, font, c.base.hex, "right", "middle");
  ctx.restore();

  // draw text in normal color (unfilled part)
  ctx.save();
  roundRect(ctx, x + w * progress, y, w * (1 - progress), h, r);
  ctx.clip();
  drawText(ctx, xpText, textX, textY, font, c.text.hex, "right", "middle");
  ctx.restore();
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
