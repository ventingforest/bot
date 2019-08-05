export const ping: Command = {
    run: (_client, msg) => msg.reply('pong!'),
    config: {
        name: 'ping',
        module: 'Core',
        description: "Check if I'm still alive <3",
    },
};

export default ping;
