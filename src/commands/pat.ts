const pat: Command = {
	run: async (tvf, msg, args) => {
		// find the mentioned member
		const member = (await tvf.checkForMember(msg, args)).user;

		// make the embed
		const embed = tvf.createEmbed('random', { thumbnail: false }).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		// check if the mentioned user was the author of the message
		if (member === msg.author) {
			return msg.channel.send(embed.setTitle(`${msg.author.username}... patted their own head? 🤔`));
		}

		if (member === tvf.bot.user) {
			return msg.channel.send(embed.setTitle(`${msg.author.username} patted my head 😇`));
		}

		return msg.channel.send(embed.setTitle(`${msg.author.username} patted ${member.username}'s head 😇`));
	},
	config: {
		name: 'pat',
		description: 'Pat another user\'s head.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
		allowGeneral: false,
	},
};

export default pat;
