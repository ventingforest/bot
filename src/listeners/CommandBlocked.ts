import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

class CommandBlocked extends Listener {
	constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
            event: 'commandBlocked'
		});
	}

	exec(msg: Message) {
		msg.channel.send(`**${this.client.constants.emojis.cross}  |** Sorry, but you are not allowed to run that command!`);
	}
}

module.exports = CommandBlocked;
