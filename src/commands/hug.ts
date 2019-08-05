export const hug: Command = {
    run: async (client, msg, args) => {
        const member = client.checkForMember(msg, args);
        if (!member) return msg.reply('you need to specify who to hug 🤗');

        if (member.user === msg.author) {
            return msg.channel.send('👀');
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
