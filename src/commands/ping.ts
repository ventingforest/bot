import { Message } from 'discord.js';

export const ping: Command = {
    run: async (_client, msg) => {
        const msg2 = (await msg.channel.send('pong!')) as Message;
        const ping = Math.round(msg2.createdTimestamp - msg.createdTimestamp);

        return msg2.edit(`pong! \`${ping}ms\``);
    },
    config: {
        name: 'ping',
        module: 'Core',
        description: "Check if I'm still alive <3",
    },
};

export default ping;
