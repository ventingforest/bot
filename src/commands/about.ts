import * as ms from 'ms';

const about: Command = {
	run: async (tvf, msg) => {
		try {
			const developer = msg.guild.roles.cache.get(tvf.roles.TECHADMIN).members.first().user;
			const members = await msg.guild.members.fetch();
			const channels = msg.guild.channels.cache;

			const embed = tvf
				.createEmbed('green')
				.setAuthor(developer.tag, developer.avatarURL())
				.setThumbnail(msg.guild.iconURL())
				.addFields([
					{
						name: 'Uptime',
						value: ms(tvf.bot.uptime, { long: true }),
						inline: true,
					},
					{
						name: tvf.other.BLANKFIELD,
						value: tvf.other.BLANKFIELD,
					},
					{
						name: 'Members',
						value: members.size,
						inline: true,
					},
					{
						name: 'Users',
						value: members.filter(m => !m.user.bot).size,
						inline: true,
					},
					{
						name: 'Bots',
						value: members.filter(m => m.user.bot).size,
						inline: true,
					},
					{
						name: tvf.other.BLANKFIELD,
						value: tvf.other.BLANKFIELD,
					},
					{
						name: 'Channels',
						value: channels.filter(c => c.type !== 'category').size,
						inline: true,
					},
					{
						name: 'Text Channels',
						value: channels.filter(c => c.type === 'text').size,
						inline: true,
					},
					{
						name: 'Voice Channels',
						value: channels.filter(c => c.type === 'voice').size,
						inline: true,
					},
				])
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
