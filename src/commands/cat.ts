const cat: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setImage((await tvf.ksoft.images.random('cat', { nsfw: false })).url).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL())),
	config: {
		name: 'cat',
		description: 'Get a picture of a cat ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default cat;