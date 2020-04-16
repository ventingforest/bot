export default {
  name: 'help',
  description: 'Helps you use me!',
  module: 'Core',
  aliases: ['h'],
  usage: 'help [command]',
  examples: ['help', 'help ping', 'help hug'],
  allowGeneral: true,
	run: async (tvf, msg, args) => {
		const embed = tvf.createEmbed({ thumbnail: false, timestamp: true })
			.setAuthor(tvf.bot.user.tag, tvf.bot.user.avatarURL())
			.setThumbnail(tvf.bot.user.avatarURL());

		// spread all of the commands into arrays
		const commands = tvf.commands
			.filter((c) => c.module !== 'Admin')
			.filter((c) => c.module !== 'Mod')
			.filter((c) => c.module !== 'FK')
			.map((c) => c.name)
			.join(', ');

		const adminCommands = tvf.commands.filter((c) => c.module === 'Admin').map((c) => c.name).join(', ');
		const modCommands = tvf.commands.filter((c) => c.module === 'Mod').map((c) => c.name).join(', ');
		const fkCommands = tvf.commands.filter((c) => c.module === 'FK').map((c) => c.name).join(', ');

		// if there are no arguments
		if (args.length === 0) {
			// populate the embed with commands
			embed
				.setTitle('Help 👋')
				.addField('Commands 🎉', `\`\`\`${commands}\`\`\``);

			if (tvf.isUser('fk', msg.author) && tvf.commands.filter(c => c.module == 'FK').size > 0) {
				embed.addField('FK ♥', `\`\`\`${fkCommands}\`\`\``);
			}

			if (tvf.isUser('mod', msg.author)) {
				embed.addField('Mod 🔨', `\`\`\`${modCommands}\`\`\``);
			}

			if (tvf.isUser('admin', msg.author)) {
				embed.addField('Admin ⚙', `\`\`\`${adminCommands}\`\`\``);
			}

			embed.addField('Support 🤗', 'If you ever spot a bug, please contact newt#1234 and explain what is wrong so that they can get to fixing it.');
		}
		else {
			// get the query
			const q = args[0].toLowerCase();

			// search for the command
			const cmd = tvf.commands.get(q);
			if (!cmd) return msg.reply('that command does not exist.');

			// setup the embed accordingly
			const { name, description, module, usage } = cmd;

			embed
				.setTitle(`${name} Command Help`)
				.setDescription(description ? description : 'No description given.')
				.addField('Module ⚙', module);

			if (usage) {
				embed.addField(
					'Usage 🤓',
					`${tvf.isProduction ? 'tvf ' : 'tvf beta '}${name} ${usage}`,
				);
			}
		}

		return msg.author.send(embed).then(() => msg.channel.type !== 'dm' ? msg.channel.send(`**${tvf.emojis.confetti}  |**  check your DMs!`) : null).catch(() => {
			tvf.logger.error(`Couldn't send help DM to ${msg.author.tag}.`);
			return msg.reply(`**${tvf.emojis.cross}  |**  I was unable to send a DM to you. This could be because of an error, or it could be because you do not allow messages from server members. Please check that you allow messages from server members, and if the error persists contact \`newt#1234\`.`);
		});
	},
} as Command;
