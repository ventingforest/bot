import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Help extends Command {
	constructor() {
		super('help', {
			aliases: ['help'],
			category: 'Core',
			description: 'Get either a list of the available commands or instructions for specified commands! Specifying a command is opitional. If a command was specified, its help text will show up.',
			args: [
				{
					id: 'commandName',
					type: 'string',
					index: 0
				},
			]
		});

		this.usage = 'help [commandName]';
		this.examples = [
			'help',
			'help ping',
		];
	}

	exec(msg: Message, { commandName }: { commandName: string }) {
		const embed = this.client.utils.embed()
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setColor(this.client.constants.colours.green)
			.setThumbnail(this.client.user.avatarURL());

		if (!commandName) {
			// Prepare the embed for a list of commands
			embed
				.setTitle('TVF Bot Commands')
				.setDescription(`For detailed information run \`${this.handler.prefix}help <commandName>\``);

			// Add a field for each category
			this.handler.categories.forEach((category) => embed.addField(category, category.map((cmd) => cmd.aliases[0]).join(', ')));

			this.client.logger.command(`${this.client.userLogCompiler(msg.author)} requested a list of commands!`);
		} else {
			// Find the command that has been searched for
			const command = this.handler.findCommand(commandName);

			if (command) {
				try {
					// Populate the embed
					embed
						.setTitle(`TVF Bot Help - ${commandName}`)
						.setDescription(command.description)
						.addField('Usage', `\`\`\`${command.usage}\`\`\``)
						.addField('Examples', `\`\`\`${command.examples.join('\n')}\`\`\``);

					this.client.logger.command(`${this.client.userLogCompiler(msg.author)} requested information about the ${commandName} command!`);
				} catch {
					embed.fields = [];
					embed
						.setTitle('That command\'s help object is not complete!')
						.setDescription('Please let newt know and they\'ll get right to fixing it!')
						.setColor(this.client.constants.colours.red);

					this.client.logger.error(`${commandName}'s help object is incomplete - woops!`);
				}
			} else {
				embed
					.setTitle('I could not find that command!')
					.setDescription(`Sorry, but I could not find any information about the command \`${commandName}\``)
					.setColor(this.client.constants.colours.red);
			}
		}

		msg.channel.send(embed);
	}
}

module.exports = Help;
export default Help;
