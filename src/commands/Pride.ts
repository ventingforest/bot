import { Command } from 'discord-akairo';
import { Message, MessageAttachment } from 'discord.js';
import fs from 'fs';
import path from 'path';

const flags = fs.readdirSync(path.join(__dirname, `..${path.sep}..${path.sep}`, 'assets', 'pride'))
    .map(f => f.slice(0, f.length - 4));

class PrideCommand extends Command {
	constructor() {
		super('pride', {
			aliases: ['pride'],
			category: 'Events',
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

        // Ensure that the specified flag is valid
        if (!flags.includes(flag)) return this.client.emojiMessage(this.client.constants.emojis.cross, 'The provided flag does not exist/is not supported!', msg.channel);

        // If the opacity is greater than 100%
        if (opacity > 1 || opacity < 0) return this.client.emojiMessage(this.client.constants.emojis.cross, 'The provided opacity has to be between 0 and 100%!', msg.channel);

        // Send the new profile picture!
        const attachment = new MessageAttachment(await this.client.pridePfp(msg.author, flag, opacity));
        msg.channel.send(attachment);
	}
}

module.exports = PrideCommand;