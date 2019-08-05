import * as Discord from 'discord.js';
import Client from '../structures/Client';
import User from '../models/user';

const guildMemberRemove = async (client: Client, member: Discord.GuildMember) =>
    User.findOneAndDelete({ id: member.user.id }).then(() =>
        console.log(`Removed ${member.user.tag} from the database.`)
    );

export default guildMemberRemove;
