import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import axios from 'axios';

const animals = ['bird', 'cat', 'dog', 'fox'];

class Cute extends Command {
	constructor() {
		super('cute', {
			aliases: ['cute', 'animal'],
			description: `Recieve a picture of a cute animal, paired alongside an interesting fact! :3\nChoose from the list below: \`\`\`${animals.join(', ')}\`\`\``,
			args: [
				{
					id: 'animal',
					type: 'lowercase',
					index: 0,
					prompt: {
						start: (msg: Message): string => `${msg.author}, what animal would you like to see a picture of? Select from the list below:\`\`\`${animals.join(', ')}\`\`\``
					}
				}
			]
		});

		this.usage = 'cute <animal>';
		this.examples = [
			'cute fox',
			'cute dog'
		];
	}

	async exec(msg: Message, { animal }: { animal: string }) {
		let fact: string, image: string;
		const embed = this.client.utils.embed()
			.setColor(this.client.constants.colours.green)
			.setAuthor(msg.author.username, msg.author.avatarURL());

		switch (animal) {
			case 'bird':
			case 'birb':
				fact = (await axios.get('https://some-random-api.ml/facts/bird')).data.fact;
				image = (await axios.get('https://some-random-api.ml/img/birb')).data.link;
				embed.setTitle('Chirp! 🐦');
				break;

			case 'cat':
			case 'catto':
			case 'kitty':
				fact = (await axios.get('https://some-random-api.ml/facts/cat')).data.fact;
				image = (await axios.get('https://some-random-api.ml/img/cat')).data.link;
				embed.setTitle('Meow! 🐈');
				break;

			case 'dog':
			case 'doggo':
			case 'puppy':
			case 'pupper':
				fact = (await axios.get('https://some-random-api.ml/facts/dog')).data.fact;
				image = (await axios.get('https://some-random-api.ml/img/dog')).data.link;
				embed.setTitle('Woof! 🐶');
				break;

			case 'fox':
				fact = (await axios.get('https://some-random-api.ml/facts/fox')).data.fact;
				image = (await axios.get('https://some-random-api.ml/img/fox')).data.link;
				embed.setTitle('Chirp! 🐦');
				break;
		}

		if (fact) {
			embed.setDescription(fact);
		}
		
		if (image) {
			embed.setImage(image);
		} else {
			embed  
				.setColor(this.client.constants.colours.red)
				.setTitle('There was an error fetching your cute picture!')
				.setDescription(`\`${animal}\` is not a valid animal. Please select one from the list below:\`\`\`${animals.join(', ')}\`\`\``)
				.setThumbnail(this.client.server.iconURL());
		}

		msg.channel.send(embed);
		this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just requested a cute ${animal}!`);
	}
}

module.exports = Cute;
export default Cute;
