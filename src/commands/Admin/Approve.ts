import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Approve extends Command {
	constructor() {
		super('approve', {
			aliases: ['approve'],
			description: 'Approves a suggestion',
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

		this.usage = 'approve <id> [comment]';
		this.examples = [
			'approve 1',
			'approve 2 This is a really cool idea!'
		];
	}

	async exec(msg: Message, { id, comment }: { id: number, comment: string }) {
		// Update the suggestion status
		this.client.social.updateSuggestionStatus(id, this.client.constants.SuggestionStatus.Approved, msg.author, comment);

		// Mark the message as seen
		await msg.react(this.client.constants.emojis.tick);
	}
}

module.exports = Approve;
export default Approve;
