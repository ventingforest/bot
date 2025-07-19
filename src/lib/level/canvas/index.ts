import {
  FontLibrary,
  type CanvasRenderingContext2D,
  type CanvasTextAlign,
  type CanvasTextBaseline,
} from "skia-canvas";
import type { PresenceStatus } from "discord.js";
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
 * Stores information about a position.
 */
export interface PositionalData {
  x: number;
  y: number;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  { x, y }: PositionalData,
  font: string,
  color: string = c.text.hex,
  align: CanvasTextAlign = "left",
  baseline: CanvasTextBaseline = "alphabetic",
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
}
