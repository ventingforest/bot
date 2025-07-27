import {
	type ChatInputCommand,
	container,
	type ContextMenuCommand,
} from "@sapphire/framework";
import {
	type ChatInputCommandInteraction,
	type ContextMenuCommandInteraction,
	MessageFlags,
	type User,
} from "discord.js";
import { Canvas } from "skia-canvas";

import { Command, config, load } from "$command";
import {
	getLevelRole,
	levelForXp,
	nextLevelRole,
	rankInGuild,
} from "$lib/level";
import {
	c,
	type CircleData,
	drawAvatar,
	drawProgress,
	drawText,
	progressStats,
	type SizeData,
} from "$lib/level/canvas";

@config({
	contextMenu: {
		idHints: {
			dev: "1398851572016087040",
			prod: "1398852596256735312",
		},
		name: "View level",
	},
	slash: {
		description: "Check your current level",
		idHints: {
			dev: "1398851572846297140",
			prod: "1398852595027804262",
		},
		name: "level",
		options(builder) {
			builder.addUserOption(option =>
				option
					.setName("user")
					.setDescription("the user to check the level of")
					.setRequired(false),
			);
		},
	},
})
class Level extends Command {
	override async chatInputRun(
		interaction: ChatInputCommandInteraction,
		_: ChatInputCommand.RunContext,
	) {
		await respond(
			interaction,
			interaction.options.getUser("user") ?? interaction.user,
		);
	}

	override async contextMenuRun(
		interaction: ContextMenuCommandInteraction,
		_: ContextMenuCommand.RunContext,
	) {
		await respond(
			interaction,
			await this.container.client.users.fetch(interaction.targetId),
		);
	}
}

await load(Level);

async function respond(
	interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
	user: User,
) {
	// don't allow bots
	if (user.bot) {
		return interaction.reply({
			content: "bots don't have levels! please choose a person.",
			flags: MessageFlags.Ephemeral,
		});
	}

	// find the member in the guild
	const member = interaction.guild?.members.cache.get(user.id);
	if (!member) {
		return interaction.reply({
			content: "user not found in the server.",
			flags: MessageFlags.Ephemeral,
		});
	}

	// fetch the user from the database
	const users = await container.db.user.findMany({
		select: { id: true, xp: true },
		where: { present: true },
	});
	const userDb = users.find(u => u.id === user.id)!;

	// create the canvas
	const canvas = new Canvas(500 * scale, 144 * scale);
	const ctx = canvas.getContext("2d");

	// background with border
	ctx.fillStyle = c.mantle.hex;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = c.base.hex;
	const border = 12 * scale;
	ctx.fillRect(
		border,
		border,
		canvas.width - border * 2,
		canvas.height - border * 2,
	);

	// avatar
	const level = levelForXp(userDb.xp);
	await drawAvatar(ctx, member, avatarCircle, {
		font: {
			size: 18 * scale,
			weight: 800,
		},
		text: level.toString(),
		...avatarBox,
	});

	// username
	drawText(ctx, {
		baseline: "top",
		font: {
			size: 30 * scale,
			weight: 850,
		},
		text: member.nickname ?? user.username,
		x: avatarCircle.x + avatarCircle.radius * 2,
		y: 20 * scale,
	});

	// rank
	const rank = rankInGuild(users, user.id);
	const levelRoleId = getLevelRole(levelForXp(userDb.xp));
	const levelRole = interaction.guild?.roles.cache.get(levelRoleId);
	drawText(ctx, {
		baseline: "top",
		colour: c.subtext0.hex,
		font: {
			size: 14 * scale,
			weight: 600,
		},
		text: `Rank #${rank.toLocaleString()} | ${levelRole?.name}`,
		x: avatarCircle.x + avatarCircle.radius * 2,
		y: 55 * scale,
	});

	// progress bar
	const stats = progressStats(userDb.xp);
	drawProgress(ctx, stats, {
		height: 18 * scale,
		text: `${stats.xpInLevel.toLocaleString()} / ${stats.xpNeeded.toLocaleString()} XP`,
		width: 300 * scale,
		x: avatarCircle.x + avatarCircle.radius * 2,
		y: avatarCircle.y + avatarCircle.radius - avatarBox.height,
	});

	// send
	const nextRoleInfo = nextLevelRole(userDb.xp);
	const nextRole = await interaction.guild?.roles.fetch(nextRoleInfo.id);
	await interaction.reply({
		content: `${user.toString()}, you are **${nextRoleInfo.xpAway.toLocaleString()} XP** away from **${nextRole?.name}**!`,
		files: [
			{
				attachment: await canvas.toBuffer("webp"),
				name: `${user.username}.webp`,
			},
		],
		flags: MessageFlags.Ephemeral,
	});
}

const scale = 3;

const avatarCircle: CircleData = {
	radius: 48 * scale,
	x: 72 * scale,
	y: 72 * scale,
};

const avatarBox: SizeData = {
	height: 24 * scale,
	width: 40 * scale,
};
