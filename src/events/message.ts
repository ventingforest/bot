import { Message, TextChannel } from 'discord.js';
import Client from '../structures/TVFClient';

const message = async (tvf: Client, msg: Message) => {
	// reactions
	if (
		msg.author.id === tvf.users.CARL &&
        msg.content.startsWith('**Welcome to TVF')
	) {
		return await msg.react(tvf.emojis.WAVE);
	}

	if (msg.channel.id === tvf.channels.STARBOARD) return await msg.react(tvf.emojis.STAR);

	// ignore messages from other bots
	if (msg.author.bot) return undefined;

	if (
		msg.mentions.roles.first() &&
        msg.mentions.roles.first().id === tvf.roles.HELPER &&
        msg.channel.id != tvf.channels.HELPER
	) {
		const embed = tvf
			.createEmbed('random')
			.setTitle(`${msg.author.username} needs help!`)
			.addField('Where?', `<#${msg.channel.id}>`)
			.addField('Message:', tvf.truncate(msg.content, 2048));

		tvf.sendToChannel(tvf.channels.HELPER, embed);

		return msg.reply(
			`Please wait, a helper will arrive shortly. If it's an emergency, call the number in <#${tvf.channels.RESOURCES}>. You can also request a one-on-one private session with a staff by typing \`?private\` in any channel.`,
		);
	}

	// prefix matching
	const prefixRegex = new RegExp(
		`^(<@!?${tvf.bot.user.id}> |${tvf.escapeRegex(tvf.prefix)})\\s*`,
	);
	const prefix = msg.content.match(prefixRegex)
		? msg.content.match(prefixRegex)[0]
		: null;

	if (prefix) {
		// get the args and command name
		const args = msg.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();

		// find the command
		const command = tvf.commands.get(commandName);
		if (!command) return undefined;

		// extract the config
		const config = command.config;

		// checks
		if (
			(config.module === 'Admin' &&
                !(
                	msg.member.roles.has(tvf.roles.ADMIN) ||
                    msg.member.roles.has(tvf.roles.TECHADMIN)
                )) ||
            ((config.module === 'Mod' &&
                !msg.member.roles.has(tvf.roles.MOD)) ||
                (config.module === 'FK' && !msg.member.roles.has(tvf.roles.FK)))
		) {
			return msg.reply(
				'you do not have permission to run that command 😢',
			);
		}

		if (config.dm && msg.channel.type == 'text') {
			msg.reply('check your DMs.');
		}

		if (config.args && args.length === 0) {
			let reply = 'you did not provide any arguments!';

			if (config.usage) {
				reply += `\nThe correct usage would be: \`${prefix}${config.name} ${config.usage}\``;
			}

			return msg.reply(reply);
		}

		if (
			!config.allowGeneral &&
            (msg.channel.id === tvf.channels.GENERAL ||
                msg.channel.id === tvf.channels.GENERAL2)
		) {
			return await msg.delete();
		}

		// attempt to execute the command
		try {
			return command.run(tvf, msg, args);
		}
		catch (error) {
			tvf.logger.error(error);
			return msg.reply(
				'there was an error trying to execute that command.',
			);
		}
	}

	// random compliments
	if (
		Math.floor(Math.random() * 300) === 1 &&
        (msg.channel.id === tvf.channels.GENERAL ||
            msg.channel.id === tvf.channels.GENERAL2)
	) {
		const compliment =
            tvf.other.COMPLIMENTS[
            	Math.floor(Math.random() * tvf.other.COMPLIMENTS.length)
            ];
		return msg.reply(compliment);
	}
};

export default message;
