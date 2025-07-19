import type { CanvasRenderingContext2D } from "skia-canvas";
import { c, drawText, scale, type PositionalData } from ".";
import { calculateLevel, xpForLevel } from "$lib/level";
import type { User } from "$prisma";

export interface ProgressStats {
  xpInLevel: number;
  xpNeeded: number;
}

export function progressStats(user: User): ProgressStats {
  const level = calculateLevel(user.xp);
  const xpInLevel = user.xp - xpForLevel(level);
  const xpNeeded = xpForLevel(level + 1) - xpForLevel(level);
  return { xpInLevel, xpNeeded };
}

export function drawProgress(
  ctx: CanvasRenderingContext2D,
  { xpInLevel, xpNeeded }: ProgressStats,
  { x, y }: PositionalData,
  w: number,
  h: number,
  text: string,
  inset: number = 12,
) {
  const progress = Math.max(0, Math.min(1, xpInLevel / xpNeeded));
  const r = h / 2;

  // background
  ctx.fillStyle = c.surface0.hex;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.save();

  // xp
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = c.green.hex;
  ctx.fillRect(x, y, w * progress, h);
  ctx.restore();

  // text
  const textPos: PositionalData = { x: x + w - inset * scale, y: y + h / 2 };
  const font = `600 ${Math.max(h - 5, 10)}px Nunito, sans-serif`;

  ctx.save();
  roundRect(ctx, x, y, w * progress, h, r);
  ctx.clip();
  drawText(ctx, text, textPos, font, c.base.hex, "right", "middle");
  ctx.restore();

  ctx.save();
  roundRect(ctx, x + w * progress, y, w * (1 - progress), h, r);
  ctx.clip();
  drawText(ctx, text, textPos, font, c.text.hex, "right", "middle");
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
