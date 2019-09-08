export const help: Command = {
	run: (tvf, msg, args) => {
		// embed
		const embed = tvf
			.createEmbed('random')
			.setAuthor(tvf.bot.user.tag, tvf.bot.user.avatarURL())
			.setThumbnail(tvf.bot.user.avatarURL());

		// spread all of the commands into arrays
		const commands = tvf.commands
			.filter((c) => c.config.module !== 'Admin')
			.filter((c) => c.config.module !== 'Mod')
			.filter((c) => c.config.module !== 'FK')
			.map((c) => c.config.name)
			.join(', ');

		const adminCommands = tvf.commands
			.filter((c) => c.config.module === 'Admin')
			.map((c) => c.config.name)
			.join(', ');

		const modCommands = tvf.commands
			.filter((c) => c.config.module === 'Mod')
			.map((c) => c.config.name)
			.join(', ');

		const fkCommands = tvf.commands
			.filter((c) => c.config.module === 'FK')
			.map((c) => c.config.name)
			.join(', ');

		// if there are no arguments
		if (args.length === 0) {
			// update the embed accordingly
			embed
				.setTitle('Help 👋')
				.addField('Commands 🎉', `\`\`\`${commands}\`\`\``);

			if (msg.member.roles.get(tvf.roles.FK)) {
				embed.addField('FK ♥', `\`\`\`${fkCommands}\`\`\``);
			}

			if (msg.member.roles.get(tvf.roles.MOD)) {
				embed.addField('Mod 🔨', `\`\`\`${modCommands}\`\`\``);
			}

			if (
				msg.member.roles.get(tvf.roles.TECHADMIN) ||
                msg.member.roles.get(tvf.roles.ADMIN)
			) {
				embed.addField('Admin ⚙', `\`\`\`${adminCommands}\`\`\``);
			}

			embed
				.addField(
					'Support 🤗',
					'If you ever spot a bug, please contact the Tech Admin and explain what is wrong so that they can get to fixing it.'
				)
				.setFooter(
					`Current Tech Admin: ${msg.guild.roles
						.get(tvf.roles.TECHADMIN)
						.members.map((m) => m.user.tag)
						.join(', ')}`
				);
		}
		else {
			// get the query
			const q = args[0].toLowerCase();

			// search for the command
			const cmd = tvf.commands.get(q);
			if (!cmd) return msg.reply('that command does not exist.');

			// setup the embed accordingly
			const { name, description, module, usage } = cmd.config;

			embed
				.setTitle(`${name} Command Help`)
				.setDescription(
					description ? description : 'No description given.'
				)
				.addField('Module ⚙', module);

			if (usage) {
				embed.addField(
					'Usage 🤓',
					`${tvf.isProduction ? 'tvf ' : 'beta '}${name} ${usage}`
				);
			}
		}

		return msg.author.send(embed);
	},
	config: {
		name: 'help',
		description: 'Helps you use me!',
		module: 'Core',
		dm: true,
	},
};

export default help;
