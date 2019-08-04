export const hug: Command = {
    run: async (client, msg, args) => {
        const member =
            msg.mentions.members.first() === undefined
                ? msg.guild.members.find(({ user }) => user.tag === args[0])
                : msg.mentions.members.first();
        if (!member) return msg.reply('you need to specify who to hug 🤗');

        if (member.user === msg.author) {
            return msg.channel.send(
                `Aw, are you lonely? Don't worry! I'll give you a hug 😇\n<@!${client.bot.user.id}> hugged <@!${member.id}> 🤗💞`
            );
        }

        await msg.delete();
        return msg.channel.send(
            `<@!${msg.author.id}> hugged <@!${member.id}> 🤗💞`
        );
    },
    config: {
        name: 'hug',
        description: 'Hug another user in the server.',
        module: 'Fun',
        args: true,
        usage: '<@user>',
    },
};

export default hug;
