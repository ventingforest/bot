export const hug: Command = {
    run: async (client, msg, args) => {
        const member = client.checkForMember(msg, args);
        if (!member) return msg.reply('you need to specify who to kiss 😏');

        if (member.user === msg.author) {
            return msg.channel.send('👀');
        }

        if (member.user === client.bot.user) {
            return msg.reply("a kiss? For me? Aww, that' so sweet! 😘");
        }

        if (
            member.user.id === '155149108183695360' ||
            member.user.id === '168274283414421504'
        ) {
            return msg.reply("HEY DON'T KISS DYNO HE'S MINE!!! 😤");
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
