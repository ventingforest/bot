import { Inhibitor, Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Support extends Inhibitor {
	constructor() {
		super('support', {
			reason: 'This command is restricted to members of the support team only!'
		});
	}

	exec(msg: Message, command: Command) {
		return command.categoryID === 'Support' && (msg.member.roles.cache.has(this.client.constants.roles.staff.support.id) || msg.member.roles.cache.has(this.client.constants.roles.staff.moderators.id));
	}
}

module.exports = Support;
