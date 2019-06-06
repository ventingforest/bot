// imports
import { Client, RichEmbed, Collection, Channel } from 'discord.js';
import { config as dotenv } from 'dotenv';
import { BotClient, CommandConfig } from './interfaces';
import * as fs from 'fs';

// dotenv
dotenv();

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

client.on('message', msg => {
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
        if ((config.admin && !authorMember.roles.find(r => r.id === '452553630105468957' || r.id === '462606587404615700')) || (config.mod && !authorMember.roles.find(r => r.id === '435897654682320925'))) {
            return msg.reply('you do not have permission to run that command 😢');
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
    // anti-advertising
    const invite = /discord.gg|discord,gg|discord.me|discord,me/g;

    if (invite.exec(member.user.username) != null) {
        return member.ban('Advertising.');
    }
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