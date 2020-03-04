import { config as dotenv } from 'dotenv';
import Client from './structures/TVFClient';

// load environmental variables
dotenv();

// create the client and start the bot
new Client().start();
