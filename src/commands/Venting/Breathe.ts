import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Breathe extends Command {
	constructor() {
		super('breathe', {
			aliases: ['breathe', 'breathing'],
			description: 'Deep breaths, everything is going to be alright <3'
		});

		this.usage = 'breathe';
		this.examples = ['breathe'];
	}

	exec(msg: Message) {
        const attachment = this.client.utils.attachment('https://media.giphy.com/media/krP2NRkLqnKEg/giphy.gif');
        msg.channel.send('Deep breaths, everything is going to be alright <3', attachment);
	}
}

module.exports = Breathe;
export default Breathe;
