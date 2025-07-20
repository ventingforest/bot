import path from "node:path";
import {
	FontLibrary,
	type CanvasRenderingContext2D,
	type CanvasTextAlign,
	type CanvasTextBaseline,
} from "skia-canvas";
import type { PresenceStatus } from "discord.js";
import { flavors } from "@catppuccin/palette";
import node_modules from "node_modules-path";

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

export const {
	mocha: { colors: c },
} = flavors;

/**
 * Colors for different presence statuses.
 */
export const statusColours: Record<PresenceStatus, string> = {
	dnd: c.red.hex,
	idle: c.yellow.hex,
	invisible: c.overlay0.hex,
	offline: c.overlay0.hex,
	online: c.green.hex,
};

export type PositionalData = {
	x: number;
	y: number;
};

export type SizeData = {
	width: number;
	height: number;
};

export type CircleData = {
	radius: number;
} & PositionalData;

export type TextOptions = {
	text: string;
	font: string;
	colour?: string;
	align?: CanvasTextAlign;
	baseline?: CanvasTextBaseline;
} & PositionalData;

export function drawText(
	ctx: CanvasRenderingContext2D,
	{
		x,
		y,
		text,
		font,
		colour = c.text.hex,
		align = "left",
		baseline = "alphabetic",
	}: TextOptions,
) {
	ctx.font = font;
	ctx.fillStyle = colour;
	ctx.textAlign = align;
	ctx.textBaseline = baseline;
	ctx.fillText(text, x, y);
}
