import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class BotBannerCommand extends Command {
	constructor() {
		super('botBanner', {
			aliases: ['botbanner', 'botban', 'bot'],
			category: 'Developer',
			description: 'Toggles TVF Bot\'s inbuilt bot banner!'
		});

		this.usage = 'botbanner';
		this.examples = ['botbanner'];
	}

	exec(msg: Message) {
		// Toggle the bot banner
		this.client.botBanner = !this.client.botBanner;

		// Inform the user
		const res = this.client.util.embed()
			.setThumbnail(this.client.server.iconURL());

		if (this.client.botBanner) {
			res
				.setTitle('Bot Banner Enabled!')
				.setDescription('Begone bots!')
				.setColor(this.client.constants.colours.green);
		} else {
			res
				.setTitle('Bot Banner Disabled!')
				.setDescription('They are safe... for now!')
				.setColor(this.client.constants.colours.red);
		}

		msg.channel.send(res);
	}
}

module.exports = BotBannerCommand;