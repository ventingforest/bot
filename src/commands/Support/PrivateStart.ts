import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import User from '../../models/user';
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
        this.client.deletePrompts(msg); // Delete any prompts

		// Get the user's document
		const doc = await User.findOne({ 'private.requested': true, 'private.id': id }, (err, res) => err ? this.client.logger.error(err) : res);

		if (!doc) {
			const error = this.client.util.embed()
				.setColor(this.client.constants.colours.red)
				.setThumbnail(this.client.server.iconURL())
				.setAuthor(msg.author.username, msg.author.avatarURL())
				.setTitle('There was an error trying to start that private venting session!')
				.setDescription(`An active private venting session could not be found with the ID \`${id}\`. Please check that you have entered it exactly as shown in the request, and try again (IDs are cAsE sensitive!)`);
			return msg.channel.send(error);
		}

		doc.private.startedAt = new Date(); // Consider the session started
		const user = await this.client.users.fetch(doc.id); // Find the user associated with the private venting session
		const embed = this.client.util.embed()
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setColor(this.client.constants.colours.green)
			.setThumbnail(user.avatarURL());

		// Create the private venting channels for the session
		const text = await this.client.server.channels.create(`${user.username}-${user.discriminator}`, {
			parent: this.client.constants.channels.staff.private.category,
			type: 'text',
			topic: `${this.client.constants.emojis.tick} | Session started: ${moment(doc.private.startedAt).format(this.client.constants.moment)} (id: ${doc.private.id})`,
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
					id: this.client.constants.roles.staff.support,
					allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
				}
			]
		});

		const voice = await this.client.server.channels.create(user.tag, {
			parent: this.client.constants.channels.staff.private.category,
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
					id: this.client.constants.roles.staff.support,
					allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
				}
			]
		});

		doc.private.channels.text = text.id;
		doc.private.channels.vc = voice.id;
		this.client.saveDoc(doc);

		// Welcome the user to private venting
		embed
			.setTitle(`Welcome to your private venting session, ${user.username}!`)
			.addField('Session opened by', msg.author.username)
			.addField('Session started', moment(doc.private.startedAt).format(this.client.constants.moment))
			.addField('Reason for session', doc.private.reason)
			.setFooter(`Session ID: ${doc.private.id}`, this.client.server.iconURL());
		text.send(`Welcome ${user} <3`, embed);

		// Inform the support team that the user's session has begun
		embed.setTitle(`${user.username}'s session has been started (:`);
		this.client.constants.channels.staff.support.send(embed);
		this.client.constants.channels.staff.private.logs.send(embed);

		// Clear expiry reminders
		timeout.timeout(doc.private.id, null);
		timeout.timeout(`${doc.private.id}1`, null);
		timeout.timeout(`${doc.private.id}2`, null);
		timeout.timeout(`${doc.private.id}3`, null);
		timeout.timeout(`${doc.private.id}4`, null);
		timeout.timeout(`${doc.private.id}5`, null);

		this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just started ${this.client.userLogCompiler(user)}'s private venting session (${doc.private.id})`);
	}
}

module.exports = PrivateStart;
export default PrivateStart;