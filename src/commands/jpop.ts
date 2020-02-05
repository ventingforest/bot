const jpop: Command = {
	run: async (tvf, msg, args) => {
		// check if the member is in a voice channel
		const voice = msg.member.voice.channel;

		if (!voice) {
			return msg.channel.send(
				'you must be in a voice channel to listen to j-pop!',
			);
		}

		// permissions check
		const permissions = voice.permissionsFor(tvf.bot.user);

		if (!permissions.has('CONNECT')) {
			return msg.channel.send(
				'I can not connect to your voice channel, please ensure that I have the proper permissions.',
			);
		}

		if (!permissions.has('SPEAK')) {
			return msg.channel.send(
				'I can not speak in this voice channel, please ensure that I have the proper permissions.',
			);
		}

		// join the voice channel and stream the music
		return await voice
			.join()
			.then((connection) =>
				connection
					.play('https://listen.moe/fallback')
					.on(
						'error',
						(error) =>
							tvf.logger.error(error) &&
					msg.channel.send(
						'Sorry, but there was an error whilst trying to stream from listen.moe. Try again later.',
					),
					),
			);
	},
	config: {
		name: 'jpop',
		description: 'Play jpop music from listen.moe!',
		module: 'Music',
		allowGeneral: false,
	},
};

export default jpop;