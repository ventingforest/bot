import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Suggest extends Command {
	constructor() {
		super('suggest', {
			aliases: ['suggest'],
			description: 'Make a suggestion!',
			args: [
				{
					id: 'suggestionText',
					type: 'text',
					match: 'rest'
				}
			]
		});

		this.usage = 'suggest <suggestion>';
		this.examples = [
			'suggest My really cool idea!'
		];
	}

	async exec(msg: Message, { suggestionText }: { suggestionText: string }) {
		// Create the suggestion
		const suggestion = await this.client.db.suggestion.create({
			data: {
				authorID: msg.author.id,
				text: suggestionText
			}
		});

		// Post it
		const embed = this.client.utils.embed()
			.setTitle(`New suggestion from ${msg.author.username}!`)
			.setThumbnail(msg.author.avatarURL())
			.setDescription(suggestion.text)
			.setFooter(`Suggestion ID: ${suggestion.id}`, this.client.server.iconURL())
			.setColor(this.client.constants.colours.white);

		const message = await this.client.tvfChannels.community.suggestions.send(embed);
		const upvote = this.client.server.emojis.cache.get(this.client.constants.emojis.upvote);
		const downvote = this.client.server.emojis.cache.get(this.client.constants.emojis.downvote);

		await message.react(upvote);
		await message.react(downvote);

		// Mark the message as read
		await msg.react(this.client.constants.emojis.tick);
	}
}

module.exports = Suggest;
export default Suggest;
