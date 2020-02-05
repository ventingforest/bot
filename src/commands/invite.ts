const invite: Command = {
	run: async (tvf, msg) => msg.channel.send(tvf.createEmbed().setTitle('TVF Server Invite').setDescription(tvf.other.INVITE).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL())),
	config: {
		name: 'invite',
		module: 'Core',
		description: 'Get an invite to the server.',
		allowGeneral: true,
	},
};

export default invite;
