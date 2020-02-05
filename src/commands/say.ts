const say: Command = {
	run: async (_tvf, msg, args) => {
		await msg.delete();

		const message = args.join(' ');
		return msg.channel.send(message);
	},
	config: {
		name: 'say',
		module: 'Admin',
		allowGeneral: true,
	},
};

export default say;
