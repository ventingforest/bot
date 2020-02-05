import { Message } from 'discord.js';

const pingCommand: Command = {
	run: async (tvf, msg) => {
		const embed = tvf.createEmbed().setTitle('Pong!').setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());
		const msg2 = (await msg.channel.send(embed)) as Message;
		const ping = Math.round(msg2.createdTimestamp - msg.createdTimestamp);

		return msg2.edit(embed.setTitle(`Pong! - ${ping}ms`));
	},
	config: {
		name: 'ping',
		module: 'Core',
		description: 'Check if I\'m still alive <3',
		allowGeneral: true,
	},
};

export default pingCommand;
