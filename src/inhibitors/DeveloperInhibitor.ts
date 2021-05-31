import { Inhibitor, Command } from 'discord-akairo';
import { Message } from 'discord.js';

class DeveloperInhibitor extends Inhibitor {
	constructor() {
		super('dev', {
			reason: 'This command is restricted to developers only!'
		});
	}

	exec(msg: Message, command: Command) {
		return command.categoryID === 'Developer';
	}
}

module.exports = DeveloperInhibitor;
