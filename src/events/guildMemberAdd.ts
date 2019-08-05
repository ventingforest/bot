import * as Discord from 'discord.js';
import User from '../models/user';
import Client from '../structures/Client';
import * as dayjs from 'dayjs';

const guildMemberAdd = async (client: Client, member: Discord.GuildMember) => {
    // restricted URLs
    if (client.config.restricted.exec(member.user.username) != null) {
        return member.ban({
            reason: 'Restricted URL in username.',
        });
    }

    // bot detection
    const botRegex = /[A-Z][a-z]+[1-9]+/g;
    const now = dayjs(new Date());
    const createdAt = dayjs(member.user.createdAt);

    if (
        botRegex.exec(member.user.username) !== null &&
        now.diff(createdAt, 'day') <= 2
    ) {
        return member.ban({
            reason: 'Bot detected.',
        });
    }

    // if the member is a bot, give it the bot squad role
    if (member.user.bot) {
        return member.roles.add(
            member.guild.roles.get(client.config.roles.bot)
        );
    }

    /*
    .......##.......##....########.....###....########....###....########.....###.....######..########
    ......##.......##.....##.....##...##.##......##......##.##...##.....##...##.##...##....##.##......
    .....##.......##......##.....##..##...##.....##.....##...##..##.....##..##...##..##.......##......
    ....##.......##.......##.....##.##.....##....##....##.....##.########..##.....##..######..######..
    ...##.......##........##.....##.#########....##....#########.##.....##.#########.......##.##......
    ..##.......##.........##.....##.##.....##....##....##.....##.##.....##.##.....##.##....##.##......
    .##.......##..........########..##.....##....##....##.....##.########..##.....##..######..########
    */
    return User.create({
        tag: member.user.tag,
        id: member.user.id,
        isolation: {
            isolated: false,
            roles: [],
        },
    });
};

export default guildMemberAdd;
