import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'Core',
			description: {
				content: 'Checks the latency between me and Discord!',
				usage: 'ping',
				examples: [
					'ping',
				],
			},
		});
	}

	exec(msg: Message) {
		const embed = this.client.util.embed()
			.setTitle('pong <3')
			.setColor(this.client.constants.colours.green)
			.setThumbnail(msg.guild.iconURL())
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setDescription('Calculating ping...');

		msg.channel.send(embed).then((resultMsg) => {
			const ping = resultMsg.createdTimestamp - msg.createdTimestamp;
			embed.setDescription(stripIndents`
                Bot Latency: ${ping}ms
                API Latency: ${this.client.ws.ping}ms
            `);
			resultMsg.edit(embed);
		});
	}
}

module.exports = PingCommand;
