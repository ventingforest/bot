const pat: Command = {
	run: async (tvf, msg, args) => {
		const emoji = tvf.bot.emojis.get(tvf.emojis.PAT).toString();

		const member = tvf.checkForMember(msg, args);
		if (!member) {return msg.reply(`you need to specify who to pat ${emoji}`);}

		await msg.delete();

		if (member.user === msg.author) {
			return msg.channel.send(
				`<@!${msg.author.id}> patted their own head ${emoji}`,
			);
		}

		return msg.channel.send(
			`<@!${msg.author.id}> patted <@!${member.id}>'s head ${emoji}`,
		);
	},
	config: {
		name: 'pat',
		description: 'Pat another user\'s head.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
	},
};

export default pat;
