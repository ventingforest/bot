import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Deny extends Command {
	constructor() {
		super('deny', {
			aliases: ['deny'],
			description: 'Denies a suggestion',
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

		this.usage = 'deny <id> [comment]';
		this.examples = [
			'deny 1',
			'deny 2 This is a really bad idea!'
		];
	}

	async exec(msg: Message, { id, comment }: { id: number, comment: string }) {
		// Update the suggestion status
		this.client.social.updateSuggestionStatus(id, this.client.constants.SuggestionStatus.Denied, msg.author, comment);

		// Mark the message as seen
		await msg.react(this.client.constants.emojis.tick);
	}
}

module.exports = Deny;
export default Deny;
