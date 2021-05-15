import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

class RestrictedChannelInhibitor extends Inhibitor {
	constructor() {
		super('restrictedChannels', {
			reason: 'Commands can not be run in general!',
		});
	}

	exec(msg: Message) {
		// todo: check for venting channels, not just #the-enchanted-woods
		return msg.channel.id === '435894444584075265';
	}
}

module.exports = RestrictedChannelInhibitor;
