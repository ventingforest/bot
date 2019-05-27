// imports
import { Client } from 'discord.js';
import { config as dotenv } from 'dotenv';

// dotenv
dotenv();

// create an instance of the bot
const client = new Client();

client.config = {
    // config
    prefix: 'tvf ',

    // authentication
    token: process.env.DISCORD
};

client.login(client.config.token);

// events
client.on('ready', () => console.log('I\'m ready!'));

client.on('message', msg => {
    // ignore messages from other bots
    if (msg.author.bot) return undefined;

    if (msg.content.startsWith(client.config.prefix)) {
        // get the args and command name
        const args = msg.content.slice(client.config.prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commandName === 'ping') {
            return msg.reply('pong!');
        }
    }
});