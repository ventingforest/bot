import { type ChatInputCommand, container } from "@sapphire/framework";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	type Interaction,
	type InteractionUpdateOptions,
	MessageFlags,
} from "discord.js";
import type { Props } from "src/interactions/leaderboard";

import { Command, config, load } from "$command";
import { getPrettyPage } from "$commands/leaderboard/_pretty";
import { getTextPage } from "$commands/leaderboard/_text";
import { pageLength } from "$lib/level";

@config({
	slash: {
		description: "view the server leaderboard",
		idHints: ["1396170991633301535"],
		name: "leaderboard",
		options(builder) {
			builder
				.addNumberOption(option =>
					option
						.setName("page")
						.setDescription("the page of the leaderboard to start at")
						.setMinValue(1),
				)
				.addBooleanOption(option =>
					option
						.setName("present")
						.setDescription(
							"only show users that are currently members of the server",
						),
				)
				.addBooleanOption(option =>
					option
						.setName("text")
						.setDescription(
							"use a text-only leaderboard instead of the graphical one",
						),
				);
		},
	},
})
class Leaderboard extends Command {
	override async chatInputRun(
		interaction: ChatInputCommandInteraction,
		_: ChatInputCommand.RunContext,
	) {
		// parse options
		const page = interaction.options.getNumber("page") ?? 1;
		const present = interaction.options.getBoolean("present") ?? true;
		const pretty = !interaction.options.getBoolean("text");

		// make sure the requested page is valid
		const props: Props = { page, present, pretty };
		const totalUsers = await container.db.user.count({
			where: present ? { present: true } : undefined,
		});
		const maxPage = Math.max(
			1,
			Math.ceil(totalUsers / (pretty ? pageLength.pretty : pageLength.text)),
		);
		if (page < 1 || page > maxPage) {
			await interaction.reply({
				content: `Page ${page} does not exist. Please choose a page between 1 and ${maxPage}.`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		// send
		await interaction.reply({
			...(await getPage(interaction, props)),
			flags: MessageFlags.Ephemeral,
		});
	}
}

await load(Leaderboard);

function makeId(
	prefix: string,
	page: number,
	{ present, pretty }: Props,
): string {
	return `lb_${prefix}_${page}_${present}${pretty ? "_pretty" : ""}`;
}

export type PagePosition = {
	page: number;
	maxPage: number;
};

export async function getPage(
	interaction: Interaction,
	props: Props,
): Promise<Omit<InteractionUpdateOptions, "content">> {
	// fetch data
	const { page, present, pretty } = props;
	const length = pretty ? pageLength.pretty : pageLength.text;
	const allUsers = await container.db.user.findMany({
		orderBy: { xp: "desc" },
		select: { id: true, present: true, xp: true },
		where: present ? { present: true } : undefined,
	});
	const pageUsers = allUsers.slice((page - 1) * length, page * length);
	const maxPage = Math.max(1, Math.ceil(allUsers.length / length));

	// find which page the user is on
	const userIndex = allUsers.findIndex(u => u.id === interaction.user.id);
	const userPage = Math.floor(userIndex / length) + 1;

	// generate page
	const content = await (pretty
		? getPrettyPage(interaction, { maxPage, page }, allUsers, pageUsers)
		: getTextPage(interaction, { maxPage, page }, allUsers, pageUsers));

	// buttons for pagination
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		// first page
		new ButtonBuilder()
			.setCustomId(makeId("jmp", 1, props))
			.setEmoji("⏮️")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(page === 1),
		// previous page
		new ButtonBuilder()
			.setCustomId(makeId("go", page - 1, props))
			.setEmoji("◀️")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(page <= 1),

		// jump to user's page
		new ButtonBuilder()
			.setCustomId(makeId("usr", userPage, props))
			.setEmoji("👤")
			.setStyle(ButtonStyle.Success)
			.setDisabled(userPage === page || userIndex < 0),
		// next page
		new ButtonBuilder()
			.setCustomId(makeId("go", page + 1, props))
			.setEmoji("▶️")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(page === maxPage),
		// last page
		new ButtonBuilder()
			.setCustomId(makeId("jmp", maxPage, props))
			.setEmoji("⏭️")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(page === maxPage),
	);

	return { components: [row], ...content };
}
