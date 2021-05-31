import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

class NameInhibitor extends Inhibitor {
	constructor() {
		super('id', {
			reason: '',
		});
	}

	exec(msg: Message) {
		return true; // ignore message
	}
}

module.exports = NameInhibitor;
