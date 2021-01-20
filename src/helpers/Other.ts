import * as Discord from 'discord.js';
import * as jimp from 'jimp';
import * as path from 'path';

export default class Other {
    // generate a pride image
    async pridePfp(user: Discord.User, type: string, opacity: number): Promise<Buffer> {
        // load the necessary images
        const image = await jimp.read(user.avatarURL({ size: 512, format: 'png' }));
        const flag = await jimp.read(path.resolve(`assets/pride/${type}.png`));

        // resize the flag and set opacity to 50%
        flag.resize(image.getWidth(), image.getHeight());
        flag.opacity(opacity);

        // overlay the flag onto the image
        image.blit(flag, 0, 0);

        // return the manipulated image's buffer
        return await image.getBufferAsync(jimp.MIME_PNG);
    }
}