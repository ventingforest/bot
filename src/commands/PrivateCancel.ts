import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import User, { IUser } from '../models/user';
import timeout from 'timeout';
import { stripIndents } from 'common-tags';

class PrivateCancelCommand extends Command {
	constructor() {
		super('privateCancel', {
			aliases: ['privatecancel', 'pvc'],
			category: 'Venting',
			description: 'Allows you to cancel a private venting session! If you are staff, you may pass an ID to cancel another person\'s session.',
            args: [
                {
                    id: 'id',
                    type: 'string',
                    index: 0
                },
                {
                    id: 'reason',
                    type: 'string',
                    match: 'rest'
                }
            ]
		});

		this.usage = 'privatecancel [id] [reason]';
		this.examples = [
			'privatecancel',
			'privatecancel ci1de'
		];
	}

	async exec(msg: Message, { id, reason }: { id: string, reason: string }) {
        await msg.delete(); // Delete the user's message for anynomity
        var doc: IUser;
        const cancelledEmbed = this.client.util.embed()
            .setColor(this.client.constants.colours.red);
        
        // Ensure that there is a specified reason
        if (reason) {
            // @ts-ignore
            reason = reason.split(' '); // @ts-ignore
            reason.shift() // @ts-ignore
            reason = reason.join(' ');
        }
        else reason = 'No reason specified!';
        
        // Check if the user wants to cancel another person's session
        if (id && this.client.isUser('Support', msg.member)) {
            doc = await User.findOne({ 'private.id': id }, (err, res) => err ? this.client.logger.error(err) : res);
            const venter = this.client.server.members.cache.get(doc.id);

            cancelledEmbed
                .setThumbnail(venter.user.avatarURL())
                .setTitle(`${msg.author.username} has cancelled ${venter.user.username}'s session`)
                .addField('Reason', reason, true)
                .addField('Venter ID', venter.id, true)
                .setFooter(`Session ID: ${doc.private.id}`, this.client.server.iconURL());

            const userEmbed = this.client.util.embed()
                .setColor(this.client.constants.colours.red)
                .setThumbnail(this.client.server.iconURL())
                .setTitle('A member of the support team has cancelled your private venting session.')
                .setDescription('If you believe this has been done in error, please do not hesitate to contact a member of the support team - or request a new session!')
                .addField('Reason', reason);

            venter.send(userEmbed).catch(() => this.client.constants.channels.community.discussion.send(stripIndents`
                ${venter.user}, your private venting session has been cancelled!
                Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please consider investigating this.
                If you believe this has been done in error, don't hesitate to contact a member of staff - or request a new session!
            `));
        }

        // If the user wants to cancel their own session
        else {
            doc = await this.client.userDoc(msg.author.id);
            const requestedEmbed = this.client.util.embed()
                .setColor(this.client.constants.colours.red)
                .setThumbnail(this.client.server.iconURL())
                .setTitle('You do not have a private venting session to cancel!')
                .setDescription('You currently do not have a pending private venting session, so no action has been taken (:');
            if (!doc.private.requested) return this.client.sendDM(msg.author, requestedEmbed);

            cancelledEmbed
                .setThumbnail(msg.author.avatarURL())
                .setTitle(`${msg.author.username} has cancelled their private venting session!`)
                .addField('Venter ID', msg.author.id, true)
                .setFooter(`Session ID: ${doc.private.id}`, this.client.server.iconURL());
        }

        // Post the embed
        this.client.constants.channels.staff.support.send(cancelledEmbed);
        this.client.constants.channels.staff.private.logs.send(cancelledEmbed);

        // Cancel the session

        // Clear the expiry reminders
        timeout.timeout(doc.private.id, null);
        timeout.timeout(`${doc.private.id}1`, null);
        timeout.timeout(`${doc.private.id}2`, null);
        timeout.timeout(`${doc.private.id}3`, null);
        timeout.timeout(`${doc.private.id}4`, null);
        timeout.timeout(`${doc.private.id}5`, null);

        // Update the venter's document
        doc.private.requested = false;
        doc.private.id = null;
        doc.private.reason = null;
        doc.private.requestedAt = null;
        doc.private.startedAt = null;
        doc.private.channels.text = null;
        doc.private.channels.vc = null;
        this.client.saveDoc(doc);
	}
}

module.exports = PrivateCancelCommand;