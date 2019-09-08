export const hug: Command = {
	run: async (tvf, msg, args) => {
		const member = tvf.checkForMember(msg, args);
		if (!member) {return msg.reply('you need to specify who to compliment 🤗');}

		const compliment =
            tvf.other.COMPLIMENTS[
            	Math.floor(Math.random() * tvf.other.COMPLIMENTS.length)
            ];

		await msg.delete();
		return msg.channel.send(
			`<@!${member.id}>, ${compliment}\n*Requested by ${msg.author.tag}*`
		);
	},
	config: {
		name: 'compliment',
		description: 'Compliment another user in the server.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
	},
};

export default hug;
