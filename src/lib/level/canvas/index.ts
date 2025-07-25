import path from "node:path";

import { flavors } from "@catppuccin/palette";
import type { PresenceStatus } from "discord.js";
import node_modules from "node_modules-path";
import {
	type CanvasRenderingContext2D,
	type CanvasTextAlign,
	type CanvasTextBaseline,
	FontLibrary,
} from "skia-canvas";

export * from "./avatar";
export * from "./progress";

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
 * Colours for different presence statuses.
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
	font: FontData;
	colour?: string;
	align?: CanvasTextAlign;
	baseline?: CanvasTextBaseline;
} & PositionalData;

export type FontData = {
	size: number;
	weight?: number;
};

export function getFont(font: FontData): string {
	return `${font.weight ?? "normal"} ${font.size}px Nunito, sans-serif`;
}

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
	ctx.font = getFont(font);
	ctx.fillStyle = colour;
	ctx.textAlign = align;
	ctx.textBaseline = baseline;

	let maxWidth: number;
	switch (align) {
		case "right":
		case "end": {
			maxWidth = x;
			break;
		}

		case "center": {
			maxWidth = Math.min(x, ctx.canvas.width - x) * 2;
			break;
		}

		case "left":
		case "start": {
			maxWidth = ctx.canvas.width - x;
			break;
		}
	}

	let displayText = text;

	// measure and truncate if needed
	if (ctx.measureText(text).width > maxWidth) {
		while (
			displayText.length > 0 &&
			ctx.measureText(displayText + "…").width > maxWidth
		) {
			displayText = displayText.slice(0, -1);
		}

		displayText += "…";
	}

	ctx.fillText(displayText, x, y);
}
