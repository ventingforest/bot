export const hug: Command = {
    run: async (_client, msg, args) => {
        const member =
            msg.mentions.members.first() === undefined
                ? msg.guild.members.find(({ user }) => user.tag === args[0])
                : msg.mentions.members.first();
        if (!member) return msg.reply('you need to specify who to kiss 😏');

        if (member.user === msg.author) {
            return msg.channel.send('👀');
        }

        await msg.delete();
        return msg.channel.send(
            `<@!${msg.author.id}> kissed <@!${member.id}> 😘💞`
        );
    },
    config: {
        name: 'kiss',
        description: 'Kiss another user in the server.',
        module: 'Fun',
        args: true,
        usage: '<@user>',
    },
};

export default hug;
