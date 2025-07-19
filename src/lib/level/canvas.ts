import {
  FontLibrary,
  loadImage,
  type CanvasRenderingContext2D,
} from "skia-canvas";
import { GuildMember, type PresenceStatus, type User } from "discord.js";
import { flavors } from "@catppuccin/palette";
import node_modules from "node_modules-path";
import path from "path";

// register the Nunito font
FontLibrary.use("Nunito", [
  path.join(
    node_modules(),
    "@fontsource-variable",
    "nunito",
    "files",
    "nunito-latin-wght-normal.woff2",
  ),
]);

/**
 * How much to scale canvas elements by.
 */
export const scale = 3;

export const {
  mocha: { colors: c },
} = flavors;

/**
 * Colors for different presence statuses.
 */
export const statusColours: Record<PresenceStatus, string> = {
  online: c.green.hex,
  idle: c.yellow.hex,
  dnd: c.red.hex,
  offline: c.overlay0.hex,
  invisible: c.overlay0.hex,
};

/**
 * Stores information about a circle.
 */
export interface CircleData {
  x: number;
  y: number;
  radius: number;
}

function circlePath(
  ctx: CanvasRenderingContext2D,
  { x, y, radius }: CircleData,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}

export async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  member: GuildMember | User,
  circle: CircleData,
) {
  const { radius } = circle;
  const borderWidth = radius / 8;
  const border: CircleData = { ...circle, radius: radius + borderWidth / 2 };

  const user = member instanceof GuildMember ? member.user : member;
  const avatar = await loadImage(
    user.displayAvatarURL({ extension: "webp", size: 128 }),
  );
  const status =
    member instanceof GuildMember
      ? (member.presence?.status ?? "offline")
      : null;

  // draw the border
  circlePath(ctx, border);
  ctx.strokeStyle = status ? statusColours[status] : c.mauve.hex;
  ctx.lineWidth = borderWidth;
  ctx.stroke();
  ctx.restore();

  // draw the avatar
  circlePath(ctx, circle);
  ctx.clip();
  ctx.drawImage(
    avatar,
    circle.x - radius,
    circle.y - radius,
    radius * 2,
    radius * 2,
  );
  ctx.restore();
}
