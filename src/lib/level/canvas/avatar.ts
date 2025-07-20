import { loadImage, type CanvasRenderingContext2D } from "skia-canvas";
import { type User, GuildMember } from "discord.js";
import {
	c,
	drawText,
	statusColours,
	type CircleData,
	type FontData,
	type PositionalData,
	type SizeData,
} from "$lib/level/canvas";

export type AvatarOptions = {
	borderColour?: string;
} & CircleData;

type AvatarBoxOptions = {
	text: string;
	font: FontData;
	bgColour?: string;
} & SizeData;

export async function drawAvatar(
	ctx: CanvasRenderingContext2D,
	member: GuildMember | User,
	{ x, y, radius, borderColour }: AvatarOptions,
	{ text, font, bgColour, width, height }: AvatarBoxOptions,
) {
	const borderWidth = radius / 8;
	const border: AvatarOptions = { radius: radius + borderWidth / 2, x, y };

	const user = member instanceof GuildMember ? member.user : member;
	const avatar = await loadImage(
		user.displayAvatarURL({ extension: "webp", size: 128 }),
	);
	const status =
		member instanceof GuildMember
			? (member.presence?.status ?? "offline")
			: null;
	borderColour ??= status ? statusColours[status] : c.mauve.hex;

	// draw the border
	circlePath(ctx, border);
	ctx.strokeStyle = borderColour;
	ctx.lineWidth = borderWidth;
	ctx.stroke();
	ctx.restore();

	// draw the avatar
	circlePath(ctx, { radius, x, y });
	ctx.clip();
	ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
	ctx.restore();

	// draw the avtar box
	ctx.fillStyle = bgColour ?? borderColour;
	const box: PositionalData = {
		x: x + radius - (3 * width) / 4,
		y: y + radius - height,
	};
	ctx.fillRect(box.x, box.y, width, height);
	drawText(ctx, {
		align: "center",
		baseline: "middle",
		colour: c.base.hex,
		font,
		text,
		x: box.x + width / 2,
		y: box.y + height / 2,
	});
}

function circlePath(
	ctx: CanvasRenderingContext2D,
	{ x, y, radius }: AvatarOptions,
) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
}
