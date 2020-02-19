const aww: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setImage((await tvf.ksoft.images.aww()).url).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL())),
	config: {
		name: 'aww',
		description: 'Get a cute picture ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default aww;