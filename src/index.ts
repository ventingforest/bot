import * as dotenv from 'dotenv';
dotenv.config();

// start the bot
import Client from './Client';
new Client().start();
