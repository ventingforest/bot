import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Consider extends Command {
	constructor() {
		super('consider', {
			aliases: ['consider'],
			description: 'Considers a suggestion',
			args: [
				{
					id: 'id',
					type: 'number',
					index: 0
				},
				{
					id: 'comment',
					type: 'text',
					match: 'rest'
				}
			]
		});

		this.usage = 'consider <id> [comment]';
		this.examples = [
			'consider 1',
			'consider 2 This is a really cool idea!'
		];
	}

	async exec(msg: Message, { id, comment }: { id: number, comment: string }) {
		const suggestion = await this.client.db.suggestion.findFirst({ where: { id }});
		const suggester = this.client.users.cache.get(suggestion.authorID);
		const message = await this.client.tvfChannels.community.suggestions.messages.fetch(suggestion.messageID);
		const embed = this.client.social.suggestionEmbed(suggestion);
		if (comment) comment = comment.split(id.toString())[1].trim();

		// Update the status of the embed to considered and add the comment to the DB if it exists
		await this.client.db.suggestion.update({
			where: { id: suggestion.id },
			data: {
				status: 3,
				comment: comment ? comment : null
			}
		});
		
		embed
			.setColor(this.client.constants.colours.yellow)
			.setTitle(`Suggestion by ${suggester.username} has been considered!`);

		// If the comment exists, add it to the embed
		if (comment) {
			embed.addField('Comment from the admins!', comment);
		}

		// Update the embed
		await message.edit(embed);

		// Mark the message as seen
		await msg.react(this.client.constants.emojis.tick);
	}
}

module.exports = Consider;
export default Consider;
