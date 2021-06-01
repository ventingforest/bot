import { Inhibitor, Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Admin extends Inhibitor {
	constructor() {
		super('admin', {
			reason: 'This command is restricted to admins only!'
		});
	}

	exec(msg: Message, command: Command) {
		return command.categoryID === 'Admin' && msg.member.roles.cache.has(this.client.constants.roles.staff.admins.id);
	}
}

module.exports = Admin;
