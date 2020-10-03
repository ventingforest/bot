export default {
  name: 'help',
  description: 'Helps you use me!',
  aliases: ['h'],
  usage: '[command]',
  allowGeneral: true,
	run: async (tvf, msg, args) => {
		const embed = tvf.createEmbed({ thumbnail: false, timestamp: true })
			.setAuthor(tvf.bot.user.tag, tvf.bot.user.avatarURL())
			.setThumbnail(tvf.bot.user.avatarURL());

		// spread all of the commands into arrays
		const commands = tvf.commands
			.filter((c) => !c.staffAccess)
			.map((c) => c.name)
			.join(', ');

		const adminCommands = tvf.commands.filter((c) => c.staffAccess && c.staffAccess.includes('Admin')).map((c) => c.name).join(', ');
		const moderationCommands = tvf.commands.filter((c) => c.staffAccess && c.staffAccess.includes('Moderation')).map((c) => c.name).join(', ');
		const supportCommands = tvf.commands.filter((c) => c.staffAccess && c.staffAccess.includes('Support')).map((c) => c.name).join(', ');
		const techCommands = tvf.commands.filter(c => c.staffAccess && c.staffAccess.includes('Tech')).map(c => c.name).join(', ');

		// if there are no arguments
		if (args.length === 0) {
			// populate the embed with commands
			embed
				.setTitle('Help 👋')
				.addField('Commands 🎉', `\`\`\`${commands}\`\`\``);

			if (tvf.isUser('Support', msg.author) && tvf.commands.filter(c => c.staffAccess && c.staffAccess.includes('Support')).size > 0) {
				embed.addField('Support ♥', `\`\`\`${supportCommands}\`\`\``);
			}

			if (tvf.isUser('Tech', msg.author) && tvf.commands.filter(c => c.staffAccess && c.staffAccess.includes('Tech')).size > 0) {
				embed.addField('Tech 💻', `\`\`\`${techCommands}\`\`\``);
			}

			if (tvf.isUser('Moderation', msg.author) && tvf.commands.filter(c => c.staffAccess && c.staffAccess.includes('Moderation')).size > 0) {
				embed.addField('Moderation 🔨', `\`\`\`${moderationCommands}\`\`\``);
			}

			if (tvf.isUser('Admin', msg.author) && tvf.commands.filter(c => c.staffAccess && c.staffAccess.includes('Admin')).size > 0) {
				embed.addField('Admin ⚙', `\`\`\`${adminCommands}\`\`\``);
			}

			embed.addField('Support 🤗', 'If you ever spot a bug, please contact the head of tech and explain what is wrong so that they can get to fixing it.');
		}
		else {
			// get the query
			const q = args[0].toLowerCase();

			// search for the command
			const cmd = tvf.commands.get(q) || tvf.commands.find(c => c.aliases && c.aliases.includes(q));
			if (!cmd) return msg.reply('that command does not exist.');

			// setup the embed accordingly
			const { name, description, category, usage, aliases } = cmd;

			embed
				.setTitle(`${name} Command Help`)
				.setDescription(description ? description : 'No description given.')
				.addField('category ⚙', category);

			if (usage) {
				embed.addField('Usage 🤓', `${tvf.isProduction ? 'tvf ' : 'tvf beta '}${name} ${usage}`);
			}

      if (aliases) {
        embed.addField('Aliases 📜', `\`\`\`${aliases[0]}\n${aliases.join('\n')}\`\`\``);
      }
		}

		return msg.author.send(embed).then(() => msg.channel.type !== 'dm' ? msg.channel.send(`**${tvf.emojis.confetti}  |**  check your DMs!`) : null).catch(() => {
			tvf.logger.error(`Couldn't send help DM to ${msg.author.tag}.`);
			return msg.reply(`**${tvf.emojis.cross}  |**  I was unable to send a DM to you. This could be because of an error, or it could be because you do not allow messages from server members. Please check that you allow messages from server members, and if the error persists contact \`newt#1234\`.`);
		});
	},
} as Command;
