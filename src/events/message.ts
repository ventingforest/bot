import { Message } from 'discord.js';
import Client from '../structures/Client';

const message = async (client: Client, msg: Message) => {
    // ignore messages from other bots
    if (msg.author.bot) return undefined;

    if (
        client.isProduction &&
        msg.mentions.roles.first() &&
        msg.mentions.roles.first().id === '481130628344184832' &&
        msg.channel.id != '471799568015818762'
    ) {
        msg.reply(
            "Please wait, a helper will arrive shortly. If it's an emergency, call the number in <#435923980336234516>. You can also request a one-on-one private session with a staff by typing `?private` in any channel."
        );

        const helperChannel = client.bot.channels.get(
            client.config.channels.helper
        );
        const embed = client.createEmbed('random');

        embed
            .setTitle(`${msg.author.tag} needs help!`)
            .setDescription(`[Link to message.](${msg.url})`)
            .addField('Where?', msg.channel, true)
            .addField(
                'Message:',
                msg.content.replace(`<@&${msg.mentions.roles.first().id}>`, ''),
                true
            );

        // @ts-ignore
        return helperChannel.send(embed);
    }

    // restricted urls
    if (client.config.restricted.exec(msg.content) != null) {
        // protect people from whois bans
        if (/\?whois/g.exec(msg.content) !== null) return;

        await msg.delete();
        return msg.member.ban({
            reason: 'Restricted URL sent.',
        });
    }

    let prefix: RegExpMatchArray | string = msg.content.match(
        client.config.prefix
    );
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
        if (
            (config.module === 'Admin' &&
                !msg.member.roles.find(
                    (r) =>
                        r.id === '452553630105468957' ||
                        r.id === '462606587404615700'
                )) ||
            (config.module === 'Mod' &&
                !msg.member.roles.find((r) => r.id === '435897654682320925'))
        ) {
            return msg.reply(
                'you do not have permission to run that command 😢'
            );
        }

        if (config.dm && msg.channel.type == 'text') {
            msg.reply('check your DMs.');
        }

        if (config.args && args.length === 0) {
            let reply = 'you did not provide any arguments!';

            if (config.usage) {
                reply += `\nThe correct usage would be: \`${
                    client.isProduction ? 'tvf ' : 'tvfbeta '
                }${config.name} ${config.usage}\``;
            }

            return msg.reply(reply);
        }

        // attempt to execute the command
        try {
            return command.run(client, msg, args);
        } catch (error) {
            console.error(error);
            return msg.reply(
                'there was an error trying to execute that command.'
            );
        }
    }
};

export default message;
