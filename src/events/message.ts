import * as Discord from 'discord.js';
import Client from '../Client';
import _ from 'lodash';

export default async (tvf: Client, msg: Discord.Message) => {
	// react to all messages in the starboard with the star emoji
	if (msg.channel.id === tvf.channels.starboard.id) return await msg.react(tvf.emojis.star);

	// ignore messages from other bots
	if (msg.author.bot) return undefined;

  // helper ping
	if (msg.mentions.roles.first() && msg.mentions.roles.first().id === tvf.roles.helper.id &&	msg.channel.id != tvf.channels.helper.id && tvf.isProduction) {
		const embed = tvf.createEmbed()
			.setTitle(`${msg.author.username} needs help!`)
			.addFields([
				{
					name: 'Where?',
					value: `<#${msg.channel.id}>`,
				},
				{
					name: 'Message',
					value: _.truncate(msg.content, { length: tvf.embedLimit.field.value }),
				},
			]);

		tvf.channels.helper.send(embed);

		return msg.reply(
			`Please wait, a helper will arrive shortly. If it's an emergency, call the number in <#${tvf.channels.resources}>. You can also request a one-on-one private session with a staff by typing \`tvf private\` in any channel. If possible, please do provide a reason by typing the reason after the command.`,
		);
	}

	// prefix matching
	const prefixRegex = new RegExp(`^(<@!?${tvf.bot.user.id}> |${_.escapeRegExp(tvf.prefix)})\\s*`);
	const prefix = msg.content.toLowerCase().match(prefixRegex) ? msg.content.toLowerCase().match(prefixRegex)[0] : null;

	if (prefix) {
		// get the args and command name
		const args = msg.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();

		// find the command
		const command = tvf.commands.get(commandName) || tvf.commands.find(c => c.aliases && c.aliases.includes(commandName));
		if (!command) return undefined;

    // checks
		if ((command.category === 'Admin' && !tvf.isUser('admin', msg.author)) || (command.category === 'Moderation' && !tvf.isUser('mod', msg.author)) || (command.category === 'FK' && !tvf.isUser('fk', msg.author)) || (command.category === 'Developer' && !tvf.isUser('developer', msg.author))) {
			return msg.channel.send(`**${tvf.emojis.cross}  |**  you are not allowed to run that command!`);
		}

		// if a command isn't allowed to be run in general, delete the message
		if (!command.allowGeneral && msg.channel.id === tvf.channels.general.id) {
			await msg.delete();
			return msg.author.send(`**${tvf.emojis.grimacing}  |**  you can not run that command in general!`);
		}

    // if there are certain permissions required to run a command
    if (command.permissions) {
      let missingPermissions = [];

      // for every permission listed, check if the user has it
      for (let i = 0; i < command.permissions.length; i++) {
        if (!msg.member.hasPermission(command.permissions[i])) missingPermissions.push(command.permissions[i]);
      }

      // if there are any permissions missing, inform the user
      if (missingPermissions.length > 0) {
        msg.author.send(`**${tvf.emojis.grimacing}  |**  you are missing these permissions in **${msg.guild.name}** to run **${command.name}**\n\`\`\`${tvf.friendlyPermissions(msg.member.permissions).join('\n')}\`\`\``);
        return msg.channel.send(`**${tvf.emojis.cross}  |**  you do not have permission to run that command! I have sent you a DM containing all of the permissions you are missing.`);
      }
    }

    // if the command requires arguments but hasn't been given any
    if (command.args && args.length === 0) {
      let reply = `**${tvf.emojis.cross}  |**  you did not provide any arguments!`;

      // if the usage is listed for the command, append it to the reply
      if (command.usage) {
        reply += `\n**${tvf.emojis.square}  |**  The correct usage would be: \`${prefix}${command.usage}\``;
      }

      return msg.channel.send(reply);
    }

		// execute the command
		try {
			return command.run(tvf, msg, args, { prefix });
		}
		catch (error) {
			tvf.logger.error(error);
			return msg.reply(
				'there was an error trying to execute that command.',
			);
		}
	}

	// get the user's document from the database
	const doc = await tvf.userDoc(msg.author.id);

	// random compliments
	if (tvf.isProduction && doc.pda && Math.floor(Math.random() * 300) === 1 && msg.channel.id === tvf.channels.general.id) {
		const compliment = tvf.compliments[Math.floor(Math.random() * tvf.compliments.length)];
		return msg.reply(compliment);
	}
};
