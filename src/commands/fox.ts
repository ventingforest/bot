const fox: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setImage((await tvf.ksoft.images.random('fox', { nsfw: false })).url).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL())),
	config: {
		name: 'fox',
		description: 'Get a picture of a fox ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default fox;