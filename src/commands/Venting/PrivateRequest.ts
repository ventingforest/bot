import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import timeout from 'timeout';
import PrivateCancel from './PrivateCancel';

class PrivateRequest extends Command {
	constructor() {
		super('privateRequest', {
			aliases: ['private', 'pv', 'private-request', 'pvr'],
			description: 'Allows you to request a private venting session!',
			args: [
				{
					id: 'reason',
					type: 'string',
					match: 'rest'
				}
			]
		});

		this.usage = 'private <reason>';
		this.examples = [
			'private Anxiety',
			'private Feeling overwhelmed'
		];
	}

	async exec(msg: Message, { reason }: { reason: string }) {
        await msg.delete(); // Delete the user's message for anynomity
		let privateVent = await this.client.db.getPrivate(msg.author.id); // Get the private venting session
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
			// If the reason has not been provided
			if (!reason) {
				embed
					.setTitle('You must provide a reason for your private venting seesion!')
					.setDescription('Please try requesting again with a reason!')
					.setColor(this.client.constants.colours.red);
				
				return this.client.utils.sendDM(msg.author, embed);
			}

			// Request the session - start by updating the user's document
			privateVent = await this.client.db.private.create({ data: {
				id: msg.author.id,
				reason,
				requestedAt: new Date()
			}});

			// Alert the support team
			const supportEmbed = this.client.utils.embed()
				.setColor(this.client.constants.colours.green)
				.setAuthor(msg.author.username, msg.author.avatarURL())
				.setTitle(`${msg.author.username} has requested a private venting session!`)
				.setThumbnail(msg.author.avatarURL())
				.setDescription(`Begin the session by typing \`${this.handler.prefix}pvs ${privateVent.id}\` in this channel!`)
				.addField('Reason', privateVent.reason)
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

			// Begin the expiry countdown
			timeout.timeout(privateVent.id, this.client.constants.privateTimeout, () => {
				// Cancel the private venting session
				this.client.db.deletePrivate(privateVent.id);

				// Inform the support team that the user's session has expired
				const expiredEmbed = this.client.utils.embed()
					.setThumbnail(this.client.server.iconURL())
					.setColor(this.client.constants.colours.red)
					.setTitle(`${msg.author.username}'s private venting session has expired!`)
					.addField('Venter ID', msg.author.id, true)
					.setFooter(`Session ID: ${privateVent.id}`, this.client.server.iconURL());

				this.client.tvfChannels.staff.support.send(expiredEmbed);

				// Inform the user that their session has expired
				expiredEmbed.fields = [];
				expiredEmbed
					.setTitle('Your private venting session has expired!')
					.setDescription(stripIndents`
						We're sorry we couldn't get to your private venting session in time ):
						We automatically cancel old private venting sessions so that users can request new ones if they still need help, and to unclog the system!
						If you would still like some help, please do not be scared to request a new session! Thanks! (:
					`);

				msg.author.send(expiredEmbed).catch(() => this.client.tvfChannels.community.discussion.send(stripIndents`
					${msg.author}, your private venting session has expired!
					Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please look into this this and ping newt#1234 if you need any help!
					If you still need a session, please do not fear to open a new one! Thanks (:
				`));
				});

				this.client.logger.command(`${this.client.userLogCompiler(msg.author)}'s private venting session (${privateVent.id}) has just expired.`);

				// Create reminders for the expiry
				const reminderEmbed = this.client.utils.embed()
					.setColor(this.client.constants.colours.orange)
					.setThumbnail(msg.author.avatarURL())
					.setDescription(`Reason: ${reason}`)
					.addField('Venter ID', msg.author.id)
					.setFooter(`Session ID: ${privateVent.id}`, this.client.server.iconURL());
				const interval = this.client.constants.privateTimeout / 6;

				timeout.timeout(`${privateVent.id}1`, interval, () => this.client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in five hours!`)));
				timeout.timeout(`${privateVent.id}2`, interval * 2, () => this.client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in four hours!`)));
				timeout.timeout(`${privateVent.id}3`, interval * 3, () => this.client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in three hours!`)));
				timeout.timeout(`${privateVent.id}4`, interval * 4, () => this.client.tvfChannels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in two hours!`)));
				timeout.timeout(`${privateVent.id}5`, interval * 5, () => this.client.tvfChannels.staff.support.send(this.client.production ? this.client.tvfRoles.staff.support.toString() : '', reminderEmbed.setTitle(`${msg.author.username}'s session will expire in one hour!`)));
		}
	}
}

module.exports = PrivateRequest;
export default PrivateRequest;
