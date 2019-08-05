import Client from '../structures/Client';

const ready = (client: Client) => {
    client.bot.user.setActivity('over you cuties <3', {
        type: 'WATCHING',
    });

    return client.logger.info('TVF Bot is ready.');
};

export default ready;
