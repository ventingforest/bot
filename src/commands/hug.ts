export const hug: Command = {
	run: async (tvf, msg, args) => {
		const member = tvf.checkForMember(msg, args);
		if (!member) return msg.reply('you need to specify who to hug 🤗');

		await msg.delete();

		if (member.user === msg.author) {
			return msg.channel.send(
				`<@!${msg.author.id}> hugged themselves 👀`,
			);
		}

		return msg.channel.send(
			`<@!${msg.author.id}> hugged <@!${member.id}> 🤗💞`,
		);
	},
	config: {
		name: 'hug',
		description: 'Hug another user in the server.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
	},
};

export default hug;
