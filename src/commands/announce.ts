import { TextChannel } from 'discord.js';

const announce: Command = {
	run: async (tvf, msg, args) => {
		await msg.delete();

		const content = args.join(' ');
		const embed = tvf.createEmbed()
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setThumbnail(msg.guild.iconURL())
			.setDescription(content);

		return (msg.guild.channels.get(tvf.channels.ANNOUNCEMENTS) as TextChannel).send(embed);
	},
	config: {
		name: 'announce',
		module: 'Mod',
		description: 'Post an announcement through the bot.',
	},
};

export default announce;