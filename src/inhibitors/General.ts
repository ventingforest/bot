import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

class General extends Inhibitor {
	constructor() {
		super('general', {
			reason: 'Commands can not be run in general!',
		});
	}

	exec(msg: Message) {
		const channels = this.client.constants.channels;
		return this.client.isUser('Staff', msg.member) ? false : [channels.general.id, channels.tw.id].includes(msg.channel.id);
	}
}

module.exports = General;
