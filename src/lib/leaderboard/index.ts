import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	type InteractionUpdateOptions,
} from "discord.js";

import type { User as FullUser } from "$prisma";

export type * from "$lib/leaderboard/plain";
export type * from "$lib/leaderboard/pretty";

export type UserData = Pick<FullUser, "id" | "present" | "xp">;

export abstract class Leaderboard {
	/**
	 * The number of users displayed per page.
	 */
	abstract pageLength: number;

	constructor(
		protected readonly users: UserData[],
		protected readonly interaction: ChatInputCommandInteraction,
		private readonly present: boolean,
	) {}

	/**
	 * The total number of pages in the leaderboard.
	 */
	get pageCount() {
		return Math.max(1, Math.ceil(this.users.length / 5));
	}

	/**
	 * Render a specific page of the leaderboard.
	 * @param page The page number to render.
	 */
	abstract render(page: number): Promise<InteractionUpdateOptions>;

	/**
	 * Generate the buttons for the leaderboard page.
	 * @param interaction The interaction that triggered the leaderboard.
	 * @param page The current page number.
	 */
	protected getButtons(page: number): ActionRowBuilder<ButtonBuilder> {
		const userIndex =
			this.users.findIndex(user => user.id === this.interaction.user.id) ?? 0;
		const userPage = Math.floor(userIndex / this.pageLength) + 1;

		const getId = (prefix: string, page: number) =>
			`lb_${this.interaction.id}_${prefix}_${page}_${this.present}`;

		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			// first page
			new ButtonBuilder()
				.setCustomId(getId("jmp", 1))
				.setEmoji("⏮️")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === 1),
			// previous page
			new ButtonBuilder()
				.setCustomId(getId("go", page - 1))
				.setEmoji("◀️")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page <= 1),

			// jump to user's page
			new ButtonBuilder()
				.setCustomId(getId("usr", userPage))
				.setEmoji("👤")
				.setStyle(ButtonStyle.Success)
				.setDisabled(userPage === page || userIndex < 0),

			// next page
			new ButtonBuilder()
				.setCustomId(getId("go", page + 1))
				.setEmoji("▶️")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === this.pageCount),
			// last page
			new ButtonBuilder()
				.setCustomId(getId("jmp", this.pageCount))
				.setEmoji("⏭️")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === this.pageCount),
		);
	}

	/**
	 * Get the users on a specific page.
	 * @param page The page number to get users from.
	 */
	protected usersOnPage(page: number): UserData[] {
		const start = (page - 1) * this.pageLength;
		const end = start + this.pageLength;
		return this.users.slice(start, end);
	}
}
