const wikihow: Command = {
	run: async (tvf, msg) => {
		const img = await tvf.ksoft.images.wikihow();
		return msg.channel.send(tvf.createEmbed('random', { thumbnail: false }).setTitle(`How To ${img.article.title}`).setURL(img.article.link).setImage(img.url).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL()));
	},
	config: {
		name: 'wikihow',
		description: 'Get a random WikiHow article.',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default wikihow;