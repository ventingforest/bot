import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import timeout from 'timeout';
import moment from 'moment';

class PrivateStart extends Command {
	constructor() {
		super('privateStart', {
			aliases: ['private-start', 'pvs'],
			description: 'Allows members of staff to start a private venting session!',
            args: [
                {
					id: 'id',
					type: 'string',
					index: 0,
                    prompt: {
                        start: (msg: Message): string => `${msg.author}, what is the ID of the session you would like to start?`
                    }
                }
            ]
		});

		this.usage = 'private-start <id>';
		this.examples = [
			'private-start',
			'private-start ci1de'
		];
	}

	async exec(msg: Message, { id }: { id: string }) {
        this.client.utils.deletePrompts(msg);
		const privateVent = await this.client.db.private.findUnique({ where: { id } });
		const startedAt = new Date();

		if (!privateVent) {
			const error = this.client.utils.embed()
				.setColor(this.client.constants.Colours.Red)
				.setThumbnail(this.client.server.iconURL())
				.setAuthor(msg.author.username, msg.author.avatarURL())
				.setTitle('There was an error trying to start that private venting session!')
				.setDescription(`An active private venting session could not be found with the ID \`${id}\`. Please check that you have entered it exactly as shown in the request, and try again (IDs are cAsE sensitive!)`);
			return msg.channel.send(error);
		}

		const dbUser = await this.client.db.user.findUnique({ where: { privateID: privateVent.id }});
		const user = await this.client.users.fetch(dbUser.id); // Find the user associated with the private venting session
		const embed = this.client.utils.embed()
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setColor(this.client.constants.Colours.Green)
			.setThumbnail(user.avatarURL());

		// Create the private venting channels for the session
		const text = await this.client.server.channels.create(`${user.username}-${user.discriminator}`, {
			parent: this.client.tvfChannels.staff.private.category,
			type: 'text',
			topic: `${this.client.constants.Emojis.Tick} | Session started: ${moment(startedAt).format(this.client.constants.moment)} (id: ${privateVent.id})`,
			permissionOverwrites: [
				{
					id: this.client.server.roles.everyone,
					allow: ['READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'],
					deny: ['VIEW_CHANNEL', 'ADD_REACTIONS', 'SEND_TTS_MESSAGES'],
				},
				{
					id: user.id,
					allow: 'VIEW_CHANNEL',
				},
				{
					id: this.client.tvfRoles.staff.support,
					allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
				}
			]
		});

		const voice = await this.client.server.channels.create(user.tag, {
			parent: this.client.tvfChannels.staff.private.category,
			type: 'voice',
			permissionOverwrites: [
				{
					id: this.client.server.roles.everyone,
					allow: ['CONNECT', 'SPEAK', 'STREAM'],
					deny: 'VIEW_CHANNEL',
				},
				{
					id: user.id,
					allow: 'VIEW_CHANNEL',
				},
				{
					id: this.client.tvfRoles.staff.support,
					allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
				}
			]
		});

		// Welcome the user to private venting
		embed
			.setTitle(`Welcome to your private venting session, ${user.username}!`)
			.addField('Session opened by', msg.author.username)
			.addField('Session started', moment(startedAt).format(this.client.constants.moment))
			.addField('Session topic', privateVent.topic)
			.setFooter(`Session ID: ${privateVent.id}`, this.client.server.iconURL());
		text.send(`Welcome ${user} <3`, embed);

		// Inform the support team that the user's session has begun
		embed.setTitle(`${user.username}'s session has been started (:`);
		this.client.tvfChannels.staff.support.send(embed);
		this.client.tvfChannels.staff.private.logs.send(embed);

		// Clear expiry reminders
		timeout.timeout(`${privateVent.id}+0`, null);
		timeout.timeout(`${privateVent.id}+1`, null);
		timeout.timeout(`${privateVent.id}+2`, null);
		timeout.timeout(`${privateVent.id}+3`, null);
		timeout.timeout(`${privateVent.id}+4`, null);
		timeout.timeout(`${privateVent.id}+5`, null);

		// Update the private vent
		await this.client.db.private.update({
			where: { id: privateVent.id },
			data: {
				startedAt,
				textID: text.id,
				voiceID: voice.id
			}
		});

		this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just started ${this.client.userLogCompiler(user)}'s private venting session (${privateVent.id})`);
	}
}

module.exports = PrivateStart;
export default PrivateStart;
