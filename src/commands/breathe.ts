import * as Discord from 'discord.js';

const breathe: Command = {
	run: async (_tvf, msg) => msg.channel.send(new Discord.MessageAttachment('https://media.giphy.com/media/krP2NRkLqnKEg/giphy.gif')),
	config: {
		name: 'breathe',
		description: 'Posts a GIF showing you how to breathe!',
		module: 'Venting',
		args: false,
		usage: 'tvf breathe',
		allowGeneral: true,
	},
};

export default breathe;