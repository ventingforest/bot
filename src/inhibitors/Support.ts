import { Inhibitor, Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Support extends Inhibitor {
	constructor() {
		super('support', {
			reason: 'This command is restricted to members of the support team only!'
		});
	}

	exec(msg: Message, command: Command) {
		if (command.categoryID === 'Support') {
			return !(msg.member.roles.cache.has(this.client.tvfRoles.staff.support.id) || msg.member.roles.cache.has(this.client.tvfRoles.staff.moderators.id) || msg.member.roles.cache.has(this.client.tvfRoles.staff.admins.id));
		}
	}
}

module.exports = Support;
