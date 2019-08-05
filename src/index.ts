import { config as dotenv } from 'dotenv';
import Client from './structures/Client';

if (process.env.NODE_ENV != 'production') dotenv();

// create the client and start the bot
new Client({
    disabledEvents: ['TYPING_START'],
}).start();
