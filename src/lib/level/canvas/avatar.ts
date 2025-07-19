import {
  c,
  drawText,
  statusColours,
  type PositionalData,
} from "$lib/level/canvas";
import { loadImage, type CanvasRenderingContext2D } from "skia-canvas";
import { type User, GuildMember } from "discord.js";

export interface AvatarData extends PositionalData {
  r: number;
  borderColour?: string;
}

export interface AvatarBoxData {
  text: string;
  font: string;
  bgColour?: string;
  w: number;
  h: number;
}

export async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  member: GuildMember | User,
  { x, y, r, borderColour }: AvatarData,
  { text, font, bgColour, w, h }: AvatarBoxData,
) {
  const borderWidth = r / 8;
  const border: AvatarData = { x, y, r: r + borderWidth / 2 };

  const user = member instanceof GuildMember ? member.user : member;
  const avatar = await loadImage(
    user.displayAvatarURL({ extension: "webp", size: 128 }),
  );
  const status =
    member instanceof GuildMember
      ? (member.presence?.status ?? "offline")
      : null;
  borderColour = borderColour || (status ? statusColours[status] : c.mauve.hex);

  // draw the border
  circlePath(ctx, border);
  ctx.strokeStyle = borderColour;
  ctx.lineWidth = borderWidth;
  ctx.stroke();
  ctx.restore();

  // draw the avatar
  circlePath(ctx, { x, y, r: r });
  ctx.clip();
  ctx.drawImage(avatar, x - r, y - r, r * 2, r * 2);
  ctx.restore();

  // draw the avtar box
  ctx.fillStyle = bgColour || borderColour;
  const box: PositionalData = { x: x + r - (3 * w) / 4, y: y + r - h };
  ctx.fillRect(box.x, box.y, w, h);
  drawText(
    ctx,
    text,
    { x: box.x + w / 2, y: box.y + h / 2 },
    font,
    c.base.hex,
    "center",
    "middle",
  );
}

function circlePath(
  ctx: CanvasRenderingContext2D,
  { x, y, r: radius }: AvatarData,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}
