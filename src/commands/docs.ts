import * as Discord from 'discord.js';
import axios from 'axios';

const docs: Command = {
    run: async (client, msg, args) => {
        const SOURCES = ['stable', 'master'];
        const source = SOURCES.includes(args.slice(-1)[0])
            ? args.pop()
            : 'master';
        const res = await axios.get(
            `https://djsdocs.sorta.moe/v2/embed?src=${source}&q=${args.join(
                ' '
            )}`
        );
        const embed = res.data;

        if (!embed) {
            return msg.reply(
                "I couldn't find the requested information. Maybe look for something that actually exists the next time!"
            );
        }

        if (
            msg.channel.type === 'dm' ||
            !(msg.channel as Discord.TextChannel)
                .permissionsFor(msg.guild.me)
                .has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)
        ) {
            return msg.channel.send({ embed });
        }

        const msg2 = (await msg.channel.send({ embed })) as Discord.Message;
        msg2.react('🗑');

        let react: Discord.Collection<string, Discord.MessageReaction>;

        try {
            react = await msg2.awaitReactions(
                (reaction, user): boolean =>
                    reaction.emoji.name === '🗑' && user.id === msg.author.id,
                { max: 1, time: 5000, errors: ['time'] }
            );
        } catch (error) {
            msg2.reactions.removeAll();
            return msg2;
        }

        react.first().message.delete();
        return msg2;
    },
    config: {
        name: 'docs',
        description: 'Allows you to search the discord.js documentation',
        module: 'Core',
        args: true,
        usage: '**query**',
    },
};

export default docs;
