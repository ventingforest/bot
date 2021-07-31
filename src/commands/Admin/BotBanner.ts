import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class BotBanner extends Command {
	constructor() {
		super('botBanner', {
			aliases: ['bot-banner', 'bot-ban'],
			description: 'Toggles TVF Bot\'s inbuilt bot banner!'
		});

		this.usage = 'bot-banner';
		this.examples = ['bot-banner'];
	}

	exec(msg: Message) {
		// Toggle the bot banner
		this.client.botBanner = !this.client.botBanner;

		// Inform the user
		const embed = this.client.utils.embed()
			.setThumbnail(this.client.server.iconURL())
			.setAuthor(msg.author.username, msg.author.avatarURL());

		if (this.client.botBanner) {
			embed
				.setTitle('Bot Banner Enabled!')
				.setDescription('Begone bots!')
				.setColor(this.client.constants.Colours.Green);
		} else {
			embed
				.setTitle('Bot Banner Disabled!')
				.setDescription('They are safe... for now!')
				.setColor(this.client.constants.Colours.Red);
		}

		msg.channel.send(embed);
		this.client.tvfChannels.staff.moderators.chat.send(embed);
		this.client.tvfChannels.staff.moderators.modlogs.send(embed);
		
		this.client.logger.command(`The bot banner has been ${this.client.botBanner ? 'enabled' : 'disabled'} by ${this.client.userLogCompiler(msg.author)}!`);
	}
}

module.exports = BotBanner;
export default BotBanner;
