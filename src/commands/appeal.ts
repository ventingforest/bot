const appeal: Command = {
	run: async (tvf, msg, args) => msg.reply(tvf.other.BAN_APPEAL),
	config: {
		name: 'appeal',
		description: 'Get the link for TVF\'s ban appeal form.',
		module: 'Core',
		allowGeneral: false,
	},
};

export default appeal;