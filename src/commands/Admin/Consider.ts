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
		// Update the suggestion status
		this.client.social.updateSuggestionStatus(id, this.client.constants.SuggestionStatus.Considered, msg.author, comment);

		// Mark the message as seen
		await msg.react(this.client.constants.emojis.tick);
	}
}

module.exports = Consider;
export default Consider;
