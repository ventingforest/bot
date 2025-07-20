import {
	GuildMember,
	type User,
	type Interaction,
	type InteractionUpdateOptions,
} from "discord.js";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";
import { container } from "@sapphire/framework";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { calculateLevel, pageLength, rankInGuild } from "$lib/level";
import { drawAvatar } from "$lib/level/canvas/avatar";
import { c, drawText } from "$lib/level/canvas";
import type { User as DbUser } from "$prisma";

const scale = 4;
const canvasWidth = 50 * pageLength.pretty * scale;

const avatarRadius = canvasWidth / (pageLength.pretty * 4);
const userSpacing = avatarRadius / 2;
const userHeight = avatarRadius * 2 + userSpacing + avatarRadius / 8;

const canvasHeight = userHeight * (pageLength.pretty + 1);
const dy = userHeight;

export async function getPrettyPage(
	interaction: Interaction,
	page: number,
	allUsers: DbUser[],
	pageUsers: DbUser[],
): Promise<InteractionUpdateOptions> {
	// create the canvas
	const canvas = new Canvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext("2d");

	// background
	ctx.fillStyle = c.base.hex;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// users
	const drawPromises = pageUsers.map(async (userDb, i) => {
		const y = userHeight + dy * i;

		if (userDb.present) {
			const member = interaction.guild?.members.fetch(userDb.id);
			if (!member) return; // skip if guild or member is missing
			return drawUser(ctx, { allUsers, member: await member, userDb, y });
		}

		const user = await container.client.users.fetch(userDb.id);
		return drawUser(ctx, { allUsers, member: user, userDb, y });
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
	member: GuildMember | User;
	y: number;
	userDb: DbUser;
	allUsers: DbUser[];
};

async function drawUser(
	ctx: CanvasRenderingContext2D,
	{ member, y, userDb, allUsers }: DrawUserOptions,
) {
	const user = member instanceof GuildMember ? member.user : member;
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
			font: `700 ${5 * scale}px Nunito, sans-serif`,
			height: 8 * scale,
			text: `#${rank}`,
			width: 16 * scale,
		},
	);

	// username
	x += avatarRadius * 2;
	const usernameY = y - avatarRadius / 2;
	drawText(ctx, {
		font: `850 ${8 * scale}px Nunito, sans-serif`,
		text: user.username,
		x,
		y: usernameY,
	});

	// level
	drawText(ctx, {
		colour: c.subtext0.hex,
		font: `600 ${6 * scale}px Nunito, sans-serif`,
		text: `Level ${calculateLevel(userDb.xp)}`,
		x,
		y: y + scale,
	});

	// progress bar
	const stats = progressStats(userDb);
	drawProgress(ctx, stats, {
		height: avatarRadius / 2,
		text: `${((stats.xpInLevel / stats.xpNeeded) * 100).toFixed(2)}%`,
		textInset: 4 * scale,
		width: canvasWidth - x - avatarRadius * 2,
		x,
		y: y + avatarRadius / 3,
	});
}
