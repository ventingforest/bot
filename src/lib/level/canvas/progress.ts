import type { CanvasRenderingContext2D } from "skia-canvas";

import { calculateLevel, xpForLevel } from "$lib/level";
import {
	c,
	type CircleData,
	drawText,
	type PositionalData,
	type SizeData,
	type TextOptions,
} from "$lib/level/canvas";

type ProgressStats = {
	xpInLevel: number;
	xpNeeded: number;
};

export function progressStats(xp: number): ProgressStats {
	const level = calculateLevel(xp);
	const xpInLevel = xp - xpForLevel(level);
	const xpNeeded = xpForLevel(level + 1) - xpForLevel(level);
	return { xpInLevel, xpNeeded };
}

type ProgressOptions = {
	width: number;
	height: number;
	text: string;
	textInset?: number;
} & PositionalData;

export function drawProgress(
	ctx: CanvasRenderingContext2D,
	{ xpInLevel, xpNeeded }: ProgressStats,
	{ x, y, width, height, text, textInset = 12 }: ProgressOptions,
) {
	const progress = Math.max(0, Math.min(1, xpInLevel / xpNeeded));
	const radius = height / 2;

	// background
	ctx.fillStyle = c.surface0.hex;
	roundRect(ctx, { height, radius, width, x, y });
	ctx.fill();
	ctx.save();

	// xp
	roundRect(ctx, { height, radius, width, x, y });
	ctx.clip();
	ctx.fillStyle = c.green.hex;
	ctx.fillRect(x, y, width * progress, height);
	ctx.restore();

	// text
	const textOptions: TextOptions = {
		align: "right",
		baseline: "middle",
		font: {
			size: Math.max(height - 5, 10),
			weight: 600,
		},
		text,
		x: x + width - textInset,
		y: y + height / 2,
	};

	ctx.save();
	roundRect(ctx, { height, radius, width: width * progress, x, y });
	ctx.clip();
	drawText(ctx, {
		...textOptions,
		colour: c.base.hex,
	});
	ctx.restore();

	ctx.save();
	roundRect(ctx, {
		height,
		radius,
		width: width * (1 - progress),
		x: x + width * progress,
		y,
	});
	ctx.clip();
	drawText(ctx, {
		...textOptions,
		colour: c.text.hex,
	});
	ctx.restore();
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	{ x, y, width, height, radius }: CircleData & SizeData,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.arcTo(x + width, y, x + width, y + radius, radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
	ctx.lineTo(x + radius, y + height);
	ctx.arcTo(x, y + height, x, y + height - radius, radius);
	ctx.lineTo(x, y + radius);
	ctx.arcTo(x, y, x + radius, y, radius);
	ctx.closePath();
}
