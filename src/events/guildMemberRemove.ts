import * as Discord from 'discord.js';
import Client from '../structures/TVFClient';
import User from '../models/user';

const guildMemberRemove = async (tvf: Client, member: Discord.GuildMember) =>
	User.findOneAndDelete({ id: member.user.id }).then(() =>
		tvf.logger.info(`Removed ${member.user.tag} from the database.`)
	);

export default guildMemberRemove;
