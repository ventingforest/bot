import { c, statusColours, type PositionalData } from "$lib/level/canvas";
import { loadImage, type CanvasRenderingContext2D } from "skia-canvas";
import { type User, GuildMember } from "discord.js";

/**
 * Stores information about a circle.
 */
export interface CircleData extends PositionalData {
  radius: number;
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

function circlePath(
  ctx: CanvasRenderingContext2D,
  { x, y, radius }: CircleData,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}
