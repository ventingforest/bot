import Client from './struct/TVFClient';
import * as dotenv from 'dotenv';
import Constants from './Constants';

dotenv.config();
new Client(Constants).start();
