import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help'],
			category: 'Core',
			description: {
				content: 'Get either a list of the available commands or instructions for specified commands! Specifying a command is opitional. If a command was specified, its help text will show up.',
				usage: 'help [commandName]',
				examples: [
					'help',
					'help ping',
				],
			},
			args: [
				{
					id: 'commandName',
					type: 'string',
					index: 0,
				},
			],
		});
	}

	exec(msg: Message, args) {
		const embed = this.client.util.embed()
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setColor('#3aa4ae')
			.setThumbnail(this.client.user.avatarURL());

		if (!args.commandName) {
			embed
				.setTitle('TVF Bot Commands')
				.setDescription(`For detailed information run \`${this.handler.prefix}help <commandName>\``);

			this.handler.categories.forEach((category) => {
				embed.addField(category, category.map((cmd) => cmd.aliases[0]).join(', '));
			});
		} else {
			const command = this.handler.findCommand(args.commandName);

			if (command) {
				try {
					embed
						.setTitle('TVF Bot Help')
						.setDescription(command.description.content)
						.addField('Usage', `\`\`\`${command.description.usage}\`\`\``)
						.addField('Examples', `\`\`\`${command.description.examples.join(', ')}\`\`\``);
				} catch {
					embed.fields = [];
					embed
						.setTitle('That command\'s help object is not complete!')
						.setDescription('Please let newt know and they\'ll get right to fixing it!');
				}
			} else {
				embed
					.setTitle('I could not find that command!')
					.setDescription(`Sorry, but I could not find any information about the command \`${args.command}\``);
			}
		}

		msg.channel.send(embed);
	}
}

module.exports = HelpCommand;
