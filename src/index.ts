// imports
import { Client, RichEmbed, Collection } from 'discord.js';
import { config as dotenv } from 'dotenv';
import { BotClient, CommandConfig } from './interfaces';
import * as fs from 'fs';
import * as dayjs from 'dayjs';

// production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
    dotenv();
}

/*
.......##.......##.....######..########.########.##.....##.########.
......##.......##.....##....##.##..........##....##.....##.##.....##
.....##.......##......##.......##..........##....##.....##.##.....##
....##.......##........######..######......##....##.....##.########.
...##.......##..............##.##..........##....##.....##.##.......
..##.......##.........##....##.##..........##....##.....##.##.......
.##.......##...........######..########....##.....#######..##.......
*/
// @ts-ignore
const client: BotClient = new Client();

client.config = {
    // config
    prefix: 'tvf ',
    restricted: /discord\.gg\/|discord,gg\/|discord\.me\/|discord,me\/|nakedphotos\.club\/|nakedphotos,club\/|privatepage\.vip\/|privatepage,vip\/|redtube\.com\/|redtube,com\//g,

    // authentication
    token: process.env.DISCORD
};

client.commands = new Collection();


/*
.......##.......##....########.##.....##.########.##....##.########..######.
......##.......##.....##.......##.....##.##.......###...##....##....##....##
.....##.......##......##.......##.....##.##.......####..##....##....##......
....##.......##.......######...##.....##.######...##.##.##....##.....######.
...##.......##........##........##...##..##.......##..####....##..........##
..##.......##.........##.........##.##...##.......##...###....##....##....##
.##.......##..........########....###....########.##....##....##.....######.
*/
client.on('ready', () => {
    client.user.setActivity('over you cuties <3', {
        type: 'WATCHING'
    });

    return console.log('I am ready.');
});

client.on('message', async msg => {
    // ignore messages from other bots
    if (msg.author.bot) return undefined;

    // get the author as a guild member
    const authorMember = msg.guild.member(msg.author);

    /*
        .......##.......##....########.########..####..######....######...########.########...######.
        ......##.......##........##....##.....##..##..##....##..##....##..##.......##.....##.##....##
        .....##.......##.........##....##.....##..##..##........##........##.......##.....##.##......
        ....##.......##..........##....########...##..##...####.##...####.######...########...######.
        ...##.......##...........##....##...##....##..##....##..##....##..##.......##...##.........##
        ..##.......##............##....##....##...##..##....##..##....##..##.......##....##..##....##
        .##.......##.............##....##.....##.####..######....######...########.##.....##..######.
        */
       if (msg.mentions.roles.first() && msg.mentions.roles.first().id === '481130628344184832') {
        msg.reply('stay put, a helper will arive shortly.');

        const helperChannel = client.channels.find(c => c.id === '471799568015818762');
        const embed = new RichEmbed();
        
        embed
            .setTitle('Help Requested!')
            .setDescription(`${msg.author} needs help!`)
            .setColor('RANDOM')
            .addField('Where?', msg.channel, true)
            .addField('Message:', msg.content.replace(`<@&${msg.mentions.roles.first().id}>`, ''), true);

        // @ts-ignore
        return helperChannel.send(embed);
    }

    /*
    .......##.......##.......###....##.....##.########..#######..##.....##..#######..########.
    ......##.......##.......##.##...##.....##....##....##.....##.###...###.##.....##.##.....##
    .....##.......##.......##...##..##.....##....##....##.....##.####.####.##.....##.##.....##
    ....##.......##.......##.....##.##.....##....##....##.....##.##.###.##.##.....##.##.....##
    ...##.......##........#########.##.....##....##....##.....##.##.....##.##.....##.##.....##
    ..##.......##.........##.....##.##.....##....##....##.....##.##.....##.##.....##.##.....##
    .##.......##..........##.....##..#######.....##.....#######..##.....##..#######..########.
    */
    // restricted urls
    if (client.config.restricted.exec(msg.content) != null) {
        // protect people from whois bans
        if (/\?whois/g.exec(msg.content) !== null) return;

        msg.delete();
        return msg.member.ban('Restricted URL sent.');
    }

    /*
    .......##.......##.....######...#######..##.....##.##.....##....###....##....##.########...######.
    ......##.......##.....##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
    .....##.......##......##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
    ....##.......##.......##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
    ...##.......##........##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
    ..##.......##.........##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
    .##.......##...........######...#######..##.....##.##.....##.##.....##.##....##.########...######.
    */
    if (msg.content.startsWith(client.config.prefix)) {
        // get the args and command name
        const args = msg.content.slice(client.config.prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        // find the command
        const command = client.commands.get(commandName);
        if (!command) return undefined;

        // extract the config
        const config: CommandConfig = command.config;

        // checks
        if ((config.admin && !authorMember.roles.find(r => r.id === '452553630105468957' || r.id === '462606587404615700'))) {
            return msg.reply('you do not have permission to run that command 😢');
        }

        if (config.dm && msg.channel.type == 'text') {
            msg.reply('check your DMs.');
        }

        // attempt to execute the command
        try {
            return command.run(client, msg, args);
        } catch (error) {
            console.error(error);
            return msg.reply('there was an error trying to execute that command.');
        }
    }
});

client.on('guildMemberAdd', member => {
    /*
    .......##.......##....##.....##..#######..########..########.......###....##.....##.########..#######..##.....##..#######..########.
    ......##.......##.....###...###.##.....##.##.....##.##............##.##...##.....##....##....##.....##.###...###.##.....##.##.....##
    .....##.......##......####.####.##.....##.##.....##.##...........##...##..##.....##....##....##.....##.####.####.##.....##.##.....##
    ....##.......##.......##.###.##.##.....##.########..######......##.....##.##.....##....##....##.....##.##.###.##.##.....##.##.....##
    ...##.......##........##.....##.##.....##.##...##...##..........#########.##.....##....##....##.....##.##.....##.##.....##.##.....##
    ..##.......##.........##.....##.##.....##.##....##..##..........##.....##.##.....##....##....##.....##.##.....##.##.....##.##.....##
    .##.......##..........##.....##..#######..##.....##.########....##.....##..#######.....##.....#######..##.....##..#######..########.
    */
    // restricted URLs
    if (client.config.restricted.exec(member.user.username) != null) {
        return member.ban('Restricted URL in username.');
    }

    // bot detection
    const botRegex = /[A-Z][a-z]+[1-9]+/g;
    const now = dayjs(new Date());
    const createdAt = dayjs(member.user.createdAt);

    if (botRegex.exec(member.user.username) !== null && now.diff(createdAt, 'day') <= 2) {
        return member.ban('Bot detected.');
    }

    // if the member is a bot, give it the bot squad role
    if (member.user.bot) {
        return member.addRole(member.guild.roles.find(r => r.id === '451344230023954442'));
    }
});

client.on('guildBanAdd', (guild, user) => {
    return guild.fetchBan(user)
        .then(({ user: banned, reason }) => console.log(`${banned.tag} was banned for ${reason}`))
        .catch(console.error);
});

/*
.......##.......##....##........#######...######...####.##....##
......##.......##.....##.......##.....##.##....##...##..###...##
.....##.......##......##.......##.....##.##.........##..####..##
....##.......##.......##.......##.....##.##...####..##..##.##.##
...##.......##........##.......##.....##.##....##...##..##..####
..##.......##.........##.......##.....##.##....##...##..##...###
.##.......##..........########..#######...######...####.##....##
*/
const cmdFiles = fs.readdirSync(`${__dirname}/commands`).filter(f => f.endsWith('.js'));
for (const file of cmdFiles) {
    const { command } = require(`./commands/${file}`);
    client.commands.set(command.config.name, command);
}


client.login(client.config.token);