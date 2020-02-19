const birb: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setImage((await tvf.ksoft.images.random('birb', { nsfw: false })).url).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL())),
	config: {
		name: 'bird',
		description: 'Get a picture of a bird ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default birb;