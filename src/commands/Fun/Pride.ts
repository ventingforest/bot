import { Command } from 'discord-akairo';
import { Message, MessageAttachment, User } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import * as jimp from 'jimp';

const flags = fs.readdirSync(path.join(__dirname, '..', '..', '..', 'assets', 'pride'))
	.map(f => f.slice(0, f.length - 4));

class Pride extends Command {
	constructor() {
		super('pride', {
			aliases: ['pride'],
			category: 'Fun',
			description: `Overlay a pride flag over your profile picture! Choose from the following:\n\`\`\`${flags.join(', ')}\n\`\`\``,
			args: [
				{
					id: 'flag',
					type: 'lowercase',
					index: 0,
					prompt: {
						start: (msg: Message): string => `${msg.author}, what flag would you like to overlay? Select from the list below:\`\`\`${flags.join(', ')}\`\`\``
					}
				},
				{
					id: 'opacity',
					type: 'number',
					index: 1,
					default: 50
				}
			]
		});

		this.usage = 'pride <flag> [opacity]';
		this.examples = [
			'pride agender',
			'pride ally 70'
		];
	}

	async exec(msg: Message, { flag, opacity }: { flag: string, opacity: number }) {
		opacity = opacity / 100 || 0.5; // Convert from percentage to decimal

		const error = this.client.util.embed()
			.setTitle('There was an error whilst generating your pride pfp!')
			.setColor(this.client.constants.colours.red)
			.setThumbnail(this.client.server.iconURL());

		// Ensure that the specified flag is valid
		if (!flags.includes(flag)) return msg.channel.send(error.setDescription('The provided flag does not exist/is not supported!'));

		// If the opacity is greater than 100%
		if (opacity > 1 || opacity < 0) return msg.channel.send(error.setDescription('The provided opacity has to be between 0 and 100%!'));

		// Send the new profile picture!
		const attachment = new MessageAttachment(await this.pridePfp(msg.author, flag, opacity));
		msg.channel.send(attachment);
	}

	/**
	 * Overlays a pride flag over a user's profile picture.
	 * @param {User} user
	 * @param {string} type
	 * @param {number} opacity
	 */
	async pridePfp(user: User, type: string, opacity: number): Promise<Buffer> {
		// load the necessary images
		const image = await jimp.read(user.avatarURL({ size: 512, format: 'png' }));
		const flag = await jimp.read(path.resolve(`assets/pride/${type}.png`));

		// resize the flag and set opacity to 50%
		flag.resize(image.getWidth(), image.getHeight());
		flag.opacity(opacity);

		// overlay the flag onto the image
		image.blit(flag, 0, 0);

		// return the manipulated image's buffer
		return image.getBufferAsync(jimp.MIME_PNG);
	}
}

module.exports = Pride;