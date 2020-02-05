const appeal: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setTitle('TVF Ban Appeal form').setDescription(tvf.other.BAN_APPEAL).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL())),
	config: {
		name: 'appeal',
		description: 'Get the link for TVF\'s ban appeal form.',
		module: 'Core',
		allowGeneral: false,
	},
};

export default appeal;