const hug: Command = {
	run: async (tvf, msg, args) => {
		// find the mentioned member
		const member = tvf.checkForMember(msg, args).user;

		// make the embed
		const compliment = tvf.other.COMPLIMENTS[Math.floor(Math.random() * tvf.other.COMPLIMENTS.length)];
		const embed = tvf.createEmbed().setTitle(compliment).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		// send the emebed
		msg.channel.send(member, embed);
		// check if the mentioned user is the bot
		if (member === tvf.bot.user) {
			return msg.reply('aww, thank you 💞');
		}
	},
	config: {
		name: 'compliment',
		description: 'Compliment another user in the server.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
		allowGeneral: false,
	},
};

export default hug;
