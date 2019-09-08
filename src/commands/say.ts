const say: Command = {
	run: async (tvf, msg, args) => {
		await msg.delete();

		const message = args.join(' ');
		return msg.channel.send(message);
	},
	config: {
		name: 'say',
		module: 'Admin',
	},
};

export default say;
