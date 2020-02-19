const dog: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setImage((await tvf.ksoft.images.random('dog', { nsfw: false })).url).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL())),
	config: {
		name: 'dog',
		description: 'Get a picture of a dog ^w^',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default dog;