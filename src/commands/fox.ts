import * as Discord from 'discord.js';

const fox: Command = {
	run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.ksoft.images.random('fox', { nsfw: false })).url)),
	config: {
		name: 'fox',
		description: 'Get a picture of a fox ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default fox;