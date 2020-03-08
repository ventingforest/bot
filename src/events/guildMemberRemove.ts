import * as Discord from 'discord.js';
import Client from '../structures/TVFClient';
import User from '../models/user';

const guildMemberRemove = async (tvf: Client, member: Discord.GuildMember) => {
        if (tvf.isProduction) {
	// delete user from database
	User.findOneAndDelete({ id: member.user.id }).then(() =>
		tvf.logger.info(`Removed ${member.user.tag} from the database.`),
	);

	// send goodbye message
	const ban = await member.guild.fetchBan(member.user);
	return tvf.sendToChannel(tvf.channels.GENERAL, ban ? `**${member.user.tag}** has been banned from the Forest.` : `**${member.user.tag}** has exited the Forest.`);
    }
};

export default guildMemberRemove;
