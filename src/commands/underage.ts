const underage: Command = {
    run: async (client, msg) => {
        await msg.delete();

        // get the member
        const member = msg.mentions.members.first();
        if (!member)
            return msg.author.send(
                'you had to tag someone to kick for being underage.'
            );

        // kick the member
        member.kick('underage');

        // send the user the message
        member.user.send(
            "You are suspected to be underage. This is against Discord's TOS and we cannot allow it. You are welcome back as soon as you are thirteen, but until then please do not return. As it stands underage members put the entire server at risk. Re-joining after this message has been sent to you will result in an immediate and permanent ban.\n\nUntil then, stay safe ♥\n- The staff of TVF"
        );

        // alert the server
        return (
            client.bot.channels
                .get(client.config.channels.main)
                // @ts-ignore
                .send(`**${member.user.tag}** was kicked for being underage.`)
        );
    },
    config: {
        name: 'underage',
        description: 'Kicks a member for being underage.',
        module: 'FK',
        args: true,
        usage: '<@user>',
    },
};

export default underage;
