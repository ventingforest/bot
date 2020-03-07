import * as Discord from 'discord.js';

const aww: Command = {
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.ksoft.images.aww()).url)),
	config: {
		name: 'aww',
		description: 'Get a cute picture ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default aww;