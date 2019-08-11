const massban: Command = {
    run: (_client, msg, args) => {
        for (let i = 0; i < msg.mentions.members.size; i++) {
            args.shift();
        }

        console.log(args);
        const reason = args[0];

        msg.mentions.members.forEach((m) => {
            m.ban({
                reason: reason || `Mass ban invoked by ${msg.author.tag}.`,
            });
        });
    },
    config: {
        name: 'massban',
        description: 'Allows you to ban many members at once',
        module: 'Mod',
        args: true,
        usage: '**@user** *@user @user @user... reason*',
    },
};

export default massban;
