const disconnect: Command = {
	run: async (_tvf, msg) => {
		const voice = msg.guild.voice.channel;

		if (msg.member.voice.channel !== voice) {
			if (voice) {
				return msg.channel.send(
					'You must be in the same voice channel as me to disconnect me.',
				);
			}
			else {
				return msg.channel.send(
					'I am not currently in a voice channel!',
				);
			}
		}

		msg.reply('goodbye 👋');
		await voice.leave();
	},
	config: {
		name: 'disconnect',
		description: 'Disconnect TVF Bot from the voice channel.',
		module: 'Music',
		allowGeneral: false,
	},
};

export default disconnect;