import { Inhibitor, Command } from 'discord-akairo';
import { Message } from 'discord.js';

class AdminInhibitor extends Inhibitor {
	constructor() {
		super('admin', {
			reason: 'This command is restricted to admins only!'
		});
	}

	exec(msg: Message, command: Command) {
		return command.categoryID === 'Admin';
	}
}

module.exports = AdminInhibitor;
