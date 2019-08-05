export const hug: Command = {
    run: async (client, msg, args) => {
        const member =
            msg.mentions.members.first() === undefined
                ? msg.guild.members.find(({ user }) => user.tag === args[0])
                : msg.mentions.members.first();
        if (!member)
            return msg.reply('you need to specify who to compliment 🤗');

        const compliment =
            client.config.compliments[
                Math.floor(Math.random() * client.config.compliments.length)
            ];

        return msg.channel.send(`<@!${member.id}>, ${compliment}`);
    },
    config: {
        name: 'compliment',
        description: 'Compliment another user in the server.',
        module: 'Fun',
        args: true,
        usage: '<@user>',
    },
};

export default hug;
