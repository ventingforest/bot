const appeal: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setTitle('TVF Ban Appeal form').setDescription(tvf.other.BAN_APPEAL).setURL(tvf.other.BAN_APPEAL).setThumbnail(tvf.server.iconURL())),
	config: {
		name: 'appeal',
		description: 'Get the link for TVF\'s ban appeal form.',
		module: 'Core',
		allowGeneral: false,
	},
};

export default appeal;