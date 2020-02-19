const kiss: Command = {
	run: async (tvf, msg, args) => {
		// find the mentioned member
		const member = (await tvf.checkForMember(msg, args)).user;

		// make the embed
		const embed = tvf.createEmbed().setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		// check if the mentioned user was the author of the message
		if (member === msg.author) {
			return msg.channel.send(embed.setTitle(`${msg.author.username}... kissed themselves? 🤔`));
		}

		if (member === tvf.bot.user) {
			return msg.channel.send(embed.setTitle(`${msg.author.username} kissed me 😳💞`));
		}

		return msg.channel.send(embed.setTitle(`${msg.author.username} kissed ${member.username} 💞`));
	},
	config: {
		name: 'kiss',
		description: 'Kiss another user in the server.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
		allowGeneral: false,
	},
};

export default kiss;
