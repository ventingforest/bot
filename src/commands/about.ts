import * as ms from 'ms';

const about: Command = {
	run: async (tvf, msg) => {
		try {
			const developer = msg.guild.roles.get(tvf.roles.TECHADMIN).members.first().user;

			const embed = tvf
				.createEmbed('green', false)
				.setAuthor(developer.tag, developer.avatarURL())
				.setThumbnail(msg.guild.iconURL())
				.addField('Uptime', ms(tvf.bot.uptime, { long: true }), true)
				.addBlankField(false)
				.addField('Members', msg.guild.members.size, true)
				.addField('Users', msg.guild.members.filter(m => !m.user.bot).size, true)
				.addField('Bots', msg.guild.members.filter(m => m.user.bot).size, true)
				.addField('Channels', msg.guild.channels.size, true)
				.addField('Text Channels', msg.guild.channels.filter(c => c.type === 'text').size, true)
				.addField('Voice Channels', msg.guild.channels.filter(c => c.type === 'voice').size, true)
				.setFooter(
					'Made with ❤ and discord.js',
					'https://miro.medium.com/max/1200/1*mn6bOs7s6Qbao15PMNRyOA.png'
				);

			return msg.channel.send(embed);
		}
		catch (error) {
			tvf.logger.error(error);
			return msg.reply(
				'there was an issue whilst executing that command '
			);
		}
	},
	config: {
		name: 'about',
		description:
            'Information about the bot and the machine it is running on!',
		module: 'Core',
	},
};

export default about;
