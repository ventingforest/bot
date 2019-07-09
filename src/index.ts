// imports
import { Client, RichEmbed, Collection } from 'discord.js';
import { config as dotenv } from 'dotenv';
import * as fs from 'fs';
import * as dayjs from 'dayjs';
import * as mongoose from 'mongoose';
import User from './models/user';

// production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
    dotenv();
}

// connect to database
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true
});

mongoose.connection.on('connected', () => console.log('Connected to database'));
mongoose.connection.on('error', error => console.error(error));
mongoose.connection.on('disconnect', () => console.log('Disconnected from database.'));

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
    prefix: isProduction ? /tvf\s|<@!581144700547760128>\s/gi : /tvfbeta\s|beta\s|<@!597190196383055894>\s/gi,
    restricted: /discord\.gg\/|discord,gg\/|discord\.me\/|discord,me\/|nakedphotos\.club\/|nakedphotos,club\/|privatepage\.vip\/|privatepage,vip\/|redtube\.com\/|redtube,com\//g,
    isolatedRole: '452662935035052032',

    // authentication
    token: isProduction ? process.env.DISCORD : process.env.DISCORDBETA
};

client.commands = new Collection();
client.userDoc = User;

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

    /*
        .......##.......##....########.########..####..######....######...########.########...######.
        ......##.......##........##....##.....##..##..##....##..##....##..##.......##.....##.##....##
        .....##.......##.........##....##.....##..##..##........##........##.......##.....##.##......
        ....##.......##..........##....########...##..##...####.##...####.######...########...######.
        ...##.......##...........##....##...##....##..##....##..##....##..##.......##...##.........##
        ..##.......##............##....##....##...##..##....##..##....##..##.......##....##..##....##
        .##.......##.............##....##.....##.####..######....######...########.##.....##..######.
        */
       if (isProduction && msg.mentions.roles.first() && msg.mentions.roles.first().id === '481130628344184832' && msg.channel.id != '471799568015818762') {
        msg.reply('Please wait, a helper will arrive shortly. If it\'s an emergency, call the number in <#435923980336234516>. You can also request a one-on-one private session with a staff by typing `?private` in any channel.');

        const helperChannel = client.channels.find(c => c.id === '471799568015818762');
        const embed = new RichEmbed();
        
        embed
            .setTitle(`${msg.author.tag} needs help!`)
            .setDescription(`[Link to message.](${msg.url})`)
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
   let prefix: RegExpMatchArray | string = msg.content.match(client.config.prefix);
   prefix = prefix === null ? prefix : prefix.join('');

    if (prefix != null) {

        // get the args and command name
        const args = msg.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        // find the command
        const command = client.commands.get(commandName);
        if (!command) return undefined;

        // extract the config
        const config = command.config;

        // checks
        if ((config.admin && !msg.member.roles.find(r => r.id === '452553630105468957' || r.id === '462606587404615700')) || (config.mod && !msg.member.roles.find(r => r.id === '435897654682320925'))) {
            return msg.reply('you do not have permission to run that command 😢');
        }

        if (config.dm && msg.channel.type == 'text') {
            msg.reply('check your DMs.');
        }

        if (config.args && args.length === 0) {
            let reply = 'you did not provide any arguments!';

            if (config.usage) {
                reply += `\nThe correct usage would be: \`${client.config.prefix}${config.name} ${config.usage}\``;
            }

            return msg.reply(reply);
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
           roles: []
       }
   });
});

client.on('guildBanAdd', (guild, user) => {
    return guild.fetchBan(user)
        .then(({ user: banned, reason }) => console.log(`${banned.tag} was banned for ${reason}`))
        .catch(console.error);
});

client.on('guildMemberRemove', member => {
    return User.findOneAndDelete({ id: member.user.id }).then(() => console.log(`Removed ${member.user.tag} from the database.`));
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