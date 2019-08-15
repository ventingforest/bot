import * as Discord from 'discord.js';

const poll: Command = {
    run: async (kaida, msg, args) => {
        // get the topic and ensure it ends with a question mark
        let topic = args.join(' ');
        if (!topic.endsWith('?')) topic = `${topic}?`;

        // create the embed
        const embed = client
            .createEmbed()
            .setThumbnail(msg.author.avatarURL())
            .setTitle(`**${msg.author.username}** started a poll!`)
            .setDescription(
                `React with the corresponding emoji to cast your vote!`
            )
            .addField('Topic', topic)
            .setFooter('This vote was started');

        // send the poll and add the default reactions
        const poll = (await msg.channel.send(embed)) as Discord.Message;

        await poll.react('✅');
        return await poll.react('❌');
    },
    config: {
        name: 'poll',
        description:
            'Creates a poll with a specified topic that people can vote on.',
        module: 'Core',
        args: true,
        usage: 'poll **topic**',
    },
};

export default poll;
