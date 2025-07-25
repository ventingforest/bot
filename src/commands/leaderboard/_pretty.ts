import { container } from "@sapphire/framework";
import {
	type APIInteractionGuildMember,
	type GuildMember,
	type Interaction,
	type InteractionUpdateOptions,
	type User,
} from "discord.js";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";

import type { PagePosition } from "$commands/leaderboard";
import { levelConf } from "$lib/data";
import { levelForXp, rankInGuild } from "$lib/level";
import {
	c,
	drawAvatar,
	drawProgress,
	drawText,
	type FontData,
	getFont,
	getUserFromMember,
	progressStats,
} from "$lib/level/canvas";
import type { User as DbUser } from "$prisma";

const { pageLength } = levelConf;
const scale = 4;
const canvasWidth = 50 * pageLength.pretty * scale;

const avatarRadius = canvasWidth / (pageLength.pretty * 4);
const userSpacing = avatarRadius / 2;
const userHeight = avatarRadius * 2 + userSpacing + avatarRadius / 8;

const canvasHeight = userHeight * (pageLength.pretty + 1);
const dy = userHeight;

export async function getPrettyPage<
	U extends Pick<DbUser, "id" | "present" | "xp">,
>(
	interaction: Interaction,
	{ page, maxPage }: PagePosition,
	allUsers: U[],
	pageUsers: U[],
): Promise<InteractionUpdateOptions> {
	// create the canvas
	const canvas = new Canvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext("2d");

	// background
	ctx.fillStyle = c.base.hex;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// page number
	const pageFont: FontData = { size: 5 * scale, weight: 700 };
	ctx.font = getFont(pageFont);
	const pageText = `Page ${page}/${maxPage}`;
	const pageSize = ctx.measureText(pageText);
	drawText(ctx, {
		colour: c.subtext0.hex,
		font: pageFont,
		text: pageText,
		x: canvasWidth - pageSize.width - 4 * scale,
		y: canvasHeight - 4 * scale,
	});

	// users
	const drawPromises = pageUsers.map(async ({ present, id, xp }, i) => {
		const y = userHeight + dy * i;

		if (present) {
			if (!interaction.member) return; // skip if guild or member is missing
			return drawUser(ctx, { allUsers, member: interaction.member, xp, y });
		}

		const user = await container.client.users.fetch(id);
		return drawUser(ctx, { allUsers, member: user, xp, y });
	});

	await Promise.all(drawPromises);

	return {
		files: [
			{
				attachment: await canvas.toBuffer("webp"),
				name: `page-${page}.webp`,
			},
		],
	};
}

type DrawUserOptions = {
	member: GuildMember | APIInteractionGuildMember | User;
	y: number;
	xp: number;
	allUsers: Array<Pick<DbUser, "id" | "xp">>;
};

async function drawUser(
	ctx: CanvasRenderingContext2D,
	{ member, y, xp, allUsers }: DrawUserOptions,
) {
	const user = await getUserFromMember(member);
	let x = avatarRadius * 2;

	// avatar
	const rank = rankInGuild(allUsers, user.id);

	let borderColour: string;
	switch (rank) {
		case 1: {
			borderColour = c.yellow.hex;
			break;
		}

		case 2: {
			borderColour = c.subtext1.hex;
			break;
		}

		case 3: {
			borderColour = c.peach.hex;
			break;
		}

		default: {
			borderColour = c.mauve.hex;
		}
	}

	await drawAvatar(
		ctx,
		member,
		{
			borderColour,
			radius: avatarRadius,
			x,
			y,
		},
		{
			bgColour: borderColour,
			font: {
				size: 5 * scale,
				weight: 700,
			},
			height: 8 * scale,
			text: `#${rank}`,
			width: 16 * scale,
		},
	);

	// username
	x += avatarRadius * 2;
	const usernameY = y - avatarRadius / 2;
	drawText(ctx, {
		font: {
			size: 8 * scale,
			weight: 850,
		},
		text: user.username,
		x,
		y: usernameY,
	});

	// level
	drawText(ctx, {
		colour: c.subtext0.hex,
		font: {
			size: 6 * scale,
			weight: 600,
		},
		text: `Level ${levelForXp(xp)}`,
		x,
		y: y + scale,
	});

	// progress bar
	const stats = progressStats(xp);
	drawProgress(ctx, stats, {
		height: avatarRadius / 2,
		text: `${((stats.xpInLevel / stats.xpNeeded) * 100).toFixed(2)}%`,
		textInset: 4 * scale,
		width: canvasWidth - x - avatarRadius * 2,
		x,
		y: y + avatarRadius / 3,
	});
}
