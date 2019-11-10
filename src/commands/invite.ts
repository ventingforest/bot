const invite: Command = {
	run: async (tvf, msg) => msg.reply(tvf.other.INVITE),
	config: {
		name: 'invite',
		module: 'Core',
		description: 'Get an invite to the server.',
		allowGeneral: true,
	},
};

export default invite;
