// imports
import { Client, RichEmbed } from 'discord.js';
import { config as dotenv } from 'dotenv';
import { BotClient } from './interfaces';
import * as util from 'util';

// dotenv
dotenv();

/*
.......##.......##....########.##.....##.##....##..######..########.####..#######..##....##..######.
......##.......##.....##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.....##.......##......##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
....##.......##.......######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
...##.......##........##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
..##.......##.........##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##.......##..........##........#######..##....##..######.....##....####..#######..##....##..######.
*/
const clean = txt => typeof txt === 'string' ? txt.replace(/`/g, '`' + String.fromCharCode(8203)) : txt;

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
    admins: [
        '326767126406889473', // newt
        '498846454828367872' // ethan
    ],

    // authentication
    token: process.env.DISCORD
};

client.login(client.config.token);

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

        if (commandName === 'ping') {
            return msg.reply('pong!');
        }

        if (commandName === 'eval') {
            if (client.config.admins.includes(msg.author.id)) {
                try {
                    // get the code
                    const code = args.join(' ');
            
                    // allow the usage of the client
                    if (code.includes('client')) {
                        // @ts-ignore
                        code.replace('client', client);
                    }
            
                    // allow the usage of the guild
                    if (code.includes('guild')) {
                        // @ts-ignore
                        code.replace('guild', msg.guild);
                    }
            
                    // evaluate the code
                    let evaled = eval(code);
            
                    // make sure the evaluated code is in a string
                    if (typeof evaled === 'string') {
                        evaled = util.inspect(evaled);
                    }
            
                    // reply with a cleaned version fo the evaluated code
                    return msg.reply(clean(evaled), { code: 'x1' });
                } catch (error) {
                    console.error(error);
                    return msg.reply(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
                }
            } else {
                return msg.reply('you do not have permission to run this command!');
            }
        }

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
    }
});