import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
type Colour = `#${string}`;

/**
 * Assets directory
 */
export const assetsDir = path.resolve('assets');

/**
 * Discord authentication details
 */
export const discord = {
    token: process.env.NODE_ENV === 'production' ? process.env.STABLE_KEY : process.env.BETA_KEY
};

export const breathingGif = 'https://media.giphy.com/media/krP2NRkLqnKEg/giphy.gif';
export const tvfId = '435894444101861408';
export const tvfColour: Colour = '#16c3b3';
export const errorColour: Colour = '#ff6961';
export const successColour: Colour = '#04ac84';
export const newtId = '326767126406889473';

export const timeouts: {
    [key: string]: number;
} = {
    xp: 60000
};
