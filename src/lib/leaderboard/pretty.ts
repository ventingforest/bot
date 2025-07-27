import { Buffer } from "node:buffer";

import { container } from "@sapphire/framework";
import {
	GuildMember,
	type InteractionUpdateOptions,
	type User,
} from "discord.js";
import { Canvas, type CanvasRenderingContext2D } from "skia-canvas";

import { Leaderboard } from "$lib/leaderboard";
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
import { guildId } from "$shared/data";

const scale = 4;
const pageLength = 5;

const canvasWidth = 50 * pageLength * scale;

const avatarRadius = canvasWidth / (pageLength * 4);
const userSpacing = avatarRadius / 2;
const userHeight = avatarRadius * 2 + userSpacing + avatarRadius / 8;

const canvasHeight = userHeight * (pageLength + 1);

export default class PrettyLeaderboard extends Leaderboard {
	override pageLength = pageLength;
	rendered = new Map<number, Uint8Array>();

	override async render(page: number): Promise<InteractionUpdateOptions> {
		// if the page has already been rendered, return it
		if (this.rendered.has(page)) return this.payload(page);

		// create the canvas
		const canvas = new Canvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext("2d");

		// background
		ctx.fillStyle = c.base.hex;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// page number
		const pageFont: FontData = { size: 5 * scale, weight: 700 };
		ctx.font = getFont(pageFont);
		const pageText = `Page ${page}/${this.pageCount}`;
		const pageSize = ctx.measureText(pageText);
		drawText(ctx, {
			colour: c.subtext0.hex,
			font: pageFont,
			text: pageText,
			x: canvasWidth - pageSize.width - 4 * scale,
			y: canvasHeight - 4 * scale,
		});

		// users
		const guild = await container.client.guilds.fetch(guildId);
		const drawPromises = this.usersOnPage(page).map(
			async ({ present, id, xp }, i) => {
				const y = userHeight * (i + 1);
				const rank = rankInGuild(this.users, id);

				const member = await (present
					? guild.members.fetch(id)
					: container.client.users.fetch(id));
				return drawUser(ctx, { member, rank, xp, y });
			},
		);

		await Promise.all(drawPromises);

		// respond
		const buffer = await canvas.toBuffer("webp");
		this.rendered.set(page, buffer);
		return this.payload(page);
	}

	private payload(page: number): InteractionUpdateOptions {
		return {
			components: [this.getButtons(page)],
			files: [
				{
					attachment: Buffer.from(this.rendered.get(page)!),
					name: `page-${page}.webp`,
				},
			],
		};
	}
}

type DrawUserOptions = {
	member: GuildMember | User;
	y: number;
	xp: number;
	rank: number;
};

async function drawUser(
	ctx: CanvasRenderingContext2D,
	{ member, y, xp, rank }: DrawUserOptions,
) {
	const user = getUserFromMember(member);
	let x = avatarRadius * 2;

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
		text:
			member instanceof GuildMember
				? (member.nickname ?? user.username)
				: user.username,
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
