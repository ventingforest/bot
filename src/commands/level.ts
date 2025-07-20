import {
	type ContextMenuCommandInteraction,
	MessageFlags,
	type User,
	type ChatInputCommandInteraction,
} from "discord.js";
import {
	container,
	type ChatInputCommand,
	type ContextMenuCommand,
} from "@sapphire/framework";
import { Canvas } from "skia-canvas";
import { drawProgress, progressStats } from "$lib/level/canvas/progress";
import { drawAvatar, type AvatarOptions } from "$lib/level/canvas/avatar";
import { calculateLevel, rankInGuild } from "$lib/level";
import { c, drawText, type CircleData, type SizeData } from "$lib/level/canvas";
import { Command, config } from "$command";

@config({
	contextMenu: {
		idHints: ["1396170994598674536"],
		name: "View level",
	},
	slash: {
		description: "Check your current level",
		idHints: ["1396170993386389514"],
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
export class Level extends Command {
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
		where: { present: true },
	});
	const row = users.find(u => u.id === user.id)!;

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
	const level = calculateLevel(row.xp);
	await drawAvatar(ctx, member, avatarCircle, {
		font: `800 ${18 * scale}px Nunito, sans-serif`,
		text: level.toString(),
		...avatarBox,
	});

	// username
	drawText(ctx, {
		baseline: "top",
		font: `850 ${30 * scale}px Nunito, sans-serif`,
		text: user.username,
		x: avatarCircle.x + avatarCircle.radius * 2,
		y: 20 * scale,
	});

	// rank
	const rank = rankInGuild(users, user.id);
	drawText(ctx, {
		baseline: "top",
		colour: c.subtext0.hex,
		font: `600 ${14 * scale}px Nunito, sans-serif`,
		text: `Rank #${rank.toLocaleString()}`,
		x: avatarCircle.x + avatarCircle.radius * 2,
		y: 55 * scale,
	});

	// progress bar
	const stats = progressStats(row);
	drawProgress(ctx, stats, {
		height: 18 * scale,
		text: `${stats.xpInLevel.toLocaleString()} / ${stats.xpNeeded.toLocaleString()} XP`,
		width: 300 * scale,
		x: avatarCircle.x + avatarCircle.radius * 2,
		y: avatarCircle.y + avatarCircle.radius - avatarBox.height,
	});

	// send
	await interaction.reply({
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
