import {
  GuildMember,
  MessageFlags,
  type ChatInputCommandInteraction,
  type PresenceStatus,
} from "discord.js";
import { Canvas, FontLibrary, loadImage } from "skia-canvas";
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

    ctx.font = `800 ${18 * scale}px Nunito, sans-serif`;
    ctx.fillStyle = colours.base.hex;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("101", boxX + boxWidth / 2, boxY + boxHeight / 2);

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
