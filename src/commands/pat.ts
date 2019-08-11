const pat: Command = {
    run: async (client, msg, args) => {
        const emoji = client.bot.emojis.get(client.config.emoji.pat).toString();

        const member = client.checkForMember(msg, args);
        if (!member)
            return msg.reply(`you need to specify who to pat ${emoji}`);

        if (member.user === msg.author) {
            return msg.channel.send(
                `<@!${msg.author.id}> patted their own head ${emoji}`
            );
        }

        await msg.delete();
        return msg.channel.send(
            `<@!${msg.author.id}> patted <@!${member.id}>'s head ${emoji}`
        );
    },
    config: {
        name: 'pat',
        description: "Pat another user's head.",
        module: 'Fun',
        args: true,
        usage: '<@user>',
    },
};

export default pat;
