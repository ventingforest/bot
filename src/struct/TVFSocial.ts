import TVFClient from './TVFClient';
import { Suggestion } from '@prisma/client';
import { MessageEmbed, User } from 'discord.js';

export default class TVFSocial {
	private client: TVFClient;
	xpCooldown: Set<string>;

	/**
	 * Initialises an instance of the TVFSocial helper
	 * @param client An instance of TVF Bot
	 */
	constructor(client: TVFClient) {
		this.client = client;
		this.xpCooldown = new Set();
	}

	/**
	 * Calculates the amount of xp required for a level.
	 * @param {number} x
	 */
	xpFor(x: number): number {
		return Math.floor(5 / 6 * x * (2 * x ** 2 + 27 * x + 91));
	}

	/**
	 * Finds the level reward for a given level!
	 * @param {number} level
	 */
	levelReward(level: number): LevelReward {
		const levelIndex = this.client.constants.levelRoles.findIndex(l => level % 2 === 0 ? l.level === level : l.level === level - 1);
		return this.client.constants.levelRoles[levelIndex];
	}

	/**
	 * Generates an embed for a suggestion
	 * @param {Suggestion} suggestion The suggestion
	 */
	suggestionEmbed(suggestion: Suggestion): MessageEmbed {
		const author = this.client.users.cache.get(suggestion.authorID);

		return this.client.utils.embed()
			.setTitle(`New suggestion from ${author.username}!`)
			.setThumbnail(author.avatarURL())
			.setDescription(suggestion.text)
			.setFooter(`Suggestion ID: ${suggestion.id}`, this.client.server.iconURL())
			.setColor(this.client.constants.colours.white);
	}

	async updateSuggestionStatus(suggestionID: number, newStatus: number, admin: User, comment?: string) {
		let suggestion = await this.client.db.suggestion.findUnique({ where: { id: suggestionID }});
		const suggester = this.client.users.cache.get(suggestion.authorID);
		const message = await this.client.tvfChannels.community.suggestions.messages.fetch(suggestion.messageID);
		const embed = this.suggestionEmbed(suggestion);
		const suggesterNotification = this.suggestionEmbed(suggestion);

		// If there is a comment, format and append it to the embed
		if (comment) {
			comment = comment.split(suggestionID.toString())[1].trim()
			comment += ` ~ ${admin.username}`
			embed.addField('Comment from the admins!', comment);
			suggesterNotification.addField('Comment from the admins!', comment);
		}

		// Update the status of the suggestion in the database
		suggestion = await this.client.db.suggestion.update({
			where: { id: suggestion.id },
			data: {
				status: newStatus,
				comment: comment ? comment : null
			}
		});

		// Update the embed accordingly
		switch (suggestion.status) {
			case this.client.constants.SuggestionStatus.Approved:
				embed
					.setColor(this.client.constants.colours.green)
					.setTitle(`Suggestion by ${suggester.username} has been approved!`);
				suggesterNotification
					.setColor(this.client.constants.colours.green)
					.setTitle(`One of your suggestions has been approved!`);
				break;
			case this.client.constants.SuggestionStatus.Denied:
				embed
					.setColor(this.client.constants.colours.red)
					.setTitle(`Suggestion by ${suggester.username} has been denied!`);
				suggesterNotification
					.setColor(this.client.constants.colours.red)
					.setTitle(`One of your suggestions has been denied!`);
				break;
			case this.client.constants.SuggestionStatus.Considered:
				embed
					.setColor(this.client.constants.colours.yellow)
					.setTitle(`Suggestion by ${suggester.username} has been considered!`);
				suggesterNotification
					.setColor(this.client.constants.colours.yellow)
					.setTitle(`One of your suggestions has been considered!`);
				break;
		}

		// Update the embed in #suggestions
		await message.edit(embed);

		// Notify the suggester
		this.client.utils.sendDM(suggester, suggesterNotification);
	}
}
