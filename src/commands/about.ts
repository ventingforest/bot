import * as ms from 'ms';

const about: Command = {
	run: async (tvf, msg) => {
		try {
			const developer = msg.guild.roles.cache.get(tvf.roles.TECHADMIN).members.first().user;
			const members = await msg.guild.members.fetch();
			const channels = msg.guild.channels.cache;

			const embed = tvf
				.createEmbed('green', false)
				.setAuthor(developer.tag, developer.avatarURL())
				.setThumbnail(msg.guild.iconURL())
				.addFields([])
				.addField('Uptime', ms(tvf.bot.uptime, { long: true }), true)
				.addField('', '')
				.addField('Members', members.size, true)
				.addField('Users', members.filter(m => !m.user.bot).size, true)
				.addField('Bots', members.filter(m => m.user.bot).size, true)
				.addField('Channels', channels.size, true)
				.addField('Text Channels', channels.filter(c => c.type === 'text').size, true)
				.addField('Voice Channels', channels.filter(c => c.type === 'voice').size, true)
				.setFooter(
					'Made with ❤ and discord.js',
					'https://miro.medium.com/max/1200/1*mn6bOs7s6Qbao15PMNRyOA.png',
				);

			return msg.channel.send(embed);
		}
		catch (error) {
			tvf.logger.error(error);
			return msg.reply(
				'there was an issue whilst executing that command ',
			);
		}
	},
	config: {
		name: 'about',
		description:
            'Information about the bot and the machine it is running on!',
		module: 'Core',
		allowGeneral: false,
	},
};

export default about;
