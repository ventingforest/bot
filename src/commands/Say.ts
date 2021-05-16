import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class SayCommand extends Command {
	constructor() {
		super('say', {
			aliases: ['say'],
			category: 'Admin',
			description: 'Repeats a message through the bot!',
			args: [
				{
					id: 'message',
					type: 'string',
					match: 'rest'
				}
			]
		});

		this.usage = 'say <message>';
		this.examples = [
			'say Hello!',
			'say You\'re cute!'
		];
	}

	exec(msg: Message, { message }: { message: string }) {
		// Clean up
		msg.delete();

		// Repeat the message
		if (message) {
			msg.channel.send(message);
		}
	}
}

module.exports = SayCommand;