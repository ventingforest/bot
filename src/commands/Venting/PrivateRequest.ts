import { Private } from '@prisma/client';
import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';
import timeout from 'timeout';
import TVFClient from '../../struct/TVFClient';
import { hri as id } from 'human-readable-ids';

class PrivateRequest extends Command {
	constructor() {
		super('privateRequest', {
			aliases: ['private', 'pv', 'private-request', 'pvr'],
			description: 'Allows you to request a private venting session!',
			args: [
				{
					id: 'topic',
					type: 'string',
					match: 'rest'
				}
			]
		});

		this.usage = 'private <session topic>';
		this.examples = [
			'private Anxiety',
			'private Feeling overwhelmed'
		];
	}

	/**
	 * Sets up the timeouts for private venting sessions
	 * @param privateVent The private venting session
	 * @param venter The owner of the session 
	 * @param ms The amount of ms until the vent must expire
	 * @param client An instance of TVF Bot
	 */
	privateTimeouts(privateVent: Private, venter: User, ms: number, client: TVFClient) {
		// Begin the expiry countdown
		timeout.timeout(`${privateVent.id}+0`, ms, async () => {
			// Cancel the private venting session
			await client.db.user.update({
				where: { privateID: privateVent.id },
				data: { privateID: null }
			});

			// Inform the support team that the user's session has expired
			const expiredEmbed = client.utils.embed()
				.setThumbnail(client.server.iconURL())
				.setColor(client.constants.colours.red)
				.setTitle(`${venter.username}'s private venting session has expired!`)
				.addField('Venter ID', venter.id, true)
				.setFooter(`Session ID: ${privateVent.id}`, client.server.iconURL());

			client.tvfChannels.staff.support.send(expiredEmbed);

			// Inform the user that their session has expired
			expiredEmbed.fields = [];
			expiredEmbed
				.setTitle('Your private venting session has expired!')
				.setDescription(stripIndents`
					We're sorry we couldn't get to your private venting session in time ):
					We automatically cancel old private venting sessions so that users can request new ones if they still need help, and to unclog the system!
					If you would still like some help, please do not be scared to request a new session! Thanks! (:
				`);

			venter.send(expiredEmbed).catch(() => client.tvfChannels.community.discussion.send(stripIndents`
				${venter}, your private venting session has expired!
				Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please look into this this and ping newt#1234 if you need any help!
				If you still need a session, please do not fear to open a new one! Thanks (:
			`));

			client.logger.command(`${client.userLogCompiler(venter)}'s private venting session (${privateVent.id}) has just expired.`);
		});

		// Create reminders for the expiry
		const reminderEmbed = client.utils.embed()
			.setColor(client.constants.colours.orange)
			.setThumbnail(venter.avatarURL())
			.setDescription(`Topic: ${privateVent.topic}`)
			.addField('Venter ID', venter.id)
			.setFooter(`Session ID: ${privateVent.id}`, client.server.iconURL());
		const interval = ms / 6;

		timeout.timeout(`${privateVent.id}+1`, interval, () => client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${venter.username}'s session will expire in five hours!`)));
		timeout.timeout(`${privateVent.id}+2`, interval * 2, () => client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${venter.username}'s session will expire in four hours!`)));
		timeout.timeout(`${privateVent.id}+3`, interval * 3, () => client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${venter.username}'s session will expire in three hours!`)));
		timeout.timeout(`${privateVent.id}+4`, interval * 4, () => client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${venter.username}'s session will expire in two hours!`)));
		timeout.timeout(`${privateVent.id}+5`, interval * 5, () => client.tvfChannels.staff.support.send(client.production ? client.tvfRoles.staff.support.toString() : '', reminderEmbed.setTitle(`${venter.username}'s session will expire in one hour!`)));
	}

	async exec(msg: Message, { topic }: { topic: string }) {
        await msg.delete();
		const user = await this.client.db.user.findFirst({ where: { id: msg.author.id }});
		let privateVent = await this.client.db.private.findFirst({ where: { id: user.privateID ? user.privateID : undefined }});
		const embed = this.client.utils.embed()
			.setThumbnail(this.client.server.iconURL())
			.setColor(this.client.constants.colours.green)
			.setAuthor(msg.author.username, msg.author.avatarURL());

		// Ensure that the user hasn't already got a pending private venting session
		if (privateVent) {
			embed
				.setTitle('You already have a pending private venting session!')
				.setDescription('Please try requesting again later!')
				.setColor(this.client.constants.colours.red);

			return this.client.utils.sendDM(msg.author, embed);
		} else {
			// If the topic has not been provided
			if (!topic) {
				embed
					.setTitle('You must provide a topic for your private venting seesion!')
					.setDescription('Please try requesting again with a topic!')
					.setColor(this.client.constants.colours.red);
				
				return this.client.utils.sendDM(msg.author, embed);
			}

			const ventID = id.random();

			// Store the ID in the user's database
			await this.client.db.user.update({
				where: { id: msg.author.id },
				data: { privateID: ventID }
			});

			// Make a vent document for the user
			privateVent = await this.client.db.private.create({
				data: {
					id: ventID,
					topic,
					requestedAt: new Date()
				}
			});

			// Alert the support team
			const supportEmbed = this.client.utils.embed()
				.setColor(this.client.constants.colours.green)
				.setAuthor(msg.author.username, msg.author.avatarURL())
				.setTitle(`${msg.author.username} has requested a private venting session!`)
				.setThumbnail(msg.author.avatarURL())
				.setDescription(`Begin the session by typing \`${this.handler.prefix}pvs ${privateVent.id}\` in this channel!`)
				.addField('Session topic', privateVent.topic)
				.addField('Venter ID', msg.author.id, true)
				.setFooter(`Session ID: ${privateVent.id}`, this.client.server.iconURL());

			this.client.tvfChannels.staff.support.send(this.client.production ? this.client.tvfRoles.staff.support.toString() : '', supportEmbed);
			this.client.tvfChannels.staff.private.logs.send(supportEmbed);

			// Alert the user
			const userEmbed = this.client.utils.embed()
				.setThumbnail(this.client.server.iconURL())
				.setColor(this.client.constants.colours.green)
				.setAuthor(msg.author.username, msg.author.avatarURL())
				.setTitle('Your private venting session has been requested!')
				.setDescription(stripIndents`
					Your session may begin quickly, or it may take some time - it depends on how busy we are, how many staff are available, and whether any staff are comfortable with taking it.
					Please remain online until your session begins. You\'ll recieve a ping from the server when we\'re ready for you. A few things to note before we start...
				`)
				.addField('Our staff are not councellors or medical professionals', 'They can not offer you medical or deep life advice.')
				.addField('Who can view your session', stripIndents`
					Your session may only be viewed by the Support Team and the Administrators. Private Venting sessions are 100% confidential, and staff are not allowed to share the contents elsewhere.
					They are only permitted to do so if it is determined that you or another person are at serious risk, or if you disclose something illegal or TOS-breaking.
				`)
				.addField('The right to transfer', 'Staff reserve the right to transfer your session over to another member of staff for any given reason during your session.');
			
			this.client.utils.sendDM(msg.author, userEmbed);
			this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just requested a private venting session (${privateVent.id})`);

			this.privateTimeouts(privateVent, msg.author, this.client.constants.privateTimeout, this.client as TVFClient);
		}
	}
}

module.exports = PrivateRequest;
export default PrivateRequest;
