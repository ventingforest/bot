const wholesome: Command = {
	run: async (tvf, msg) => {
		let img = await tvf.ksoft.images.reddit('wholesome', { removeNSFW: true, span: 'week' });

		// ensure that the image is not a gif
		while (img.url.endsWith('.gif')) {
			img = await tvf.ksoft.images.reddit('wholesome', { removeNSFW: true, span: 'week' });
		}

		return msg.channel.send(
			tvf.createEmbed('orange', { thumbnail: false })
				.setTitle(img.post.title)
				.setURL(img.post.link)
				.setImage(img.url)
				.setFooter(`Requested by ${msg.author.tag} | ${tvf.emojis.THUMBS.UP} ${img.post.upvotes}`, msg.author.avatarURL()),
		);
	},
	config: {
		name: 'wholesome',
		description: 'Gets a random image from r/wholesome!',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default wholesome;