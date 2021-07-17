import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import timeout from 'timeout';
import { stripIndents } from 'common-tags';
import { Private } from '@prisma/client';

class PrivateCancel extends Command {
	constructor() {
		super('privateCancel', {
			aliases: ['private-cancel', 'pvc'],
			description: 'Allows you to cancel a private venting session! If you are staff, you may pass an ID to cancel another person\'s session.',
            args: [
                {
                    id: 'memberTag',
					type: 'member',
					index: 0
                },
                {
                    id: 'reason',
                    type: 'string',
                    match: 'rest',
                    default: 'No reason specified.'
                }
            ]
		});

		this.usage = 'private-cancel [id] [reason]';
		this.examples = [
			'private-cancel',
			'private-cancel ci1de'
		];
	}

    /**
     * Clears all related timeouts.
     * @param privateVent 
     */
    clearTimeouts(privateVent: Private) {
        // Clear all related timeouts
        timeout.timeout(privateVent.id, null);
        timeout.timeout(`${privateVent.id}1`, null);
        timeout.timeout(`${privateVent.id}2`, null);
        timeout.timeout(`${privateVent.id}3`, null);
        timeout.timeout(`${privateVent.id}4`, null);
        timeout.timeout(`${privateVent.id}5`, null);
    }

	async exec(msg: Message, { memberTag, reason }: { memberTag: GuildMember, reason: string }) {
        await msg.delete(); // Delete the user's message for anynomity
        const privateVent = await this.client.db.getPrivate(memberTag ? memberTag.id : msg.author.id);
        const cancelledEmbed = this.client.utils.embed()
            .setAuthor(msg.author.username, msg.author.avatarURL())
            .setColor(this.client.constants.colours.red);
        
        // Check if the user wants to cancel another person's session
        if ((memberTag && memberTag.id) && this.client.utils.isUser('Support', msg.member)) {
            const venter = this.client.server.members.cache.get(privateVent.id);

            cancelledEmbed
                .setThumbnail(venter.user.avatarURL())
                .setTitle(`${msg.author.username} has cancelled ${venter.user.username}'s session`)
                .addField('Reason', reason, true)
                .addField('Venter ID', venter.id, true)
                .setFooter(`Session ID: ${privateVent.id}`, this.client.server.iconURL());

            const userEmbed = this.client.utils.embed()
                .setColor(this.client.constants.colours.red)
                .setThumbnail(this.client.server.iconURL())
                .setTitle('A member of the support team has cancelled your private venting session.')
                .setDescription('If you believe this has been done in error, please do not hesitate to contact a member of the support team - or request a new session!')
                .addField('Reason', reason);

            venter.send(userEmbed).catch(() => this.client.tvfChannels.community.discussion.send(stripIndents`
                ${venter.user}, your private venting session has been cancelled!
                Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please consider investigating this.
                If you believe this has been done in error, don't hesitate to contact a member of staff - or request a new session!
            `));

            this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just cancelled ${this.client.userLogCompiler(venter.user)}'s private venting session (${privateVent.id})`);
        }

        // If the user wants to cancel their own session
        else {
            // If the user does not have a requested session
            if (!privateVent) {
                const requestedEmbed = this.client.utils.embed()
                    .setColor(this.client.constants.colours.red)
                    .setThumbnail(this.client.server.iconURL())
                    .setAuthor(msg.author.username, msg.author.avatarURL())
                    .setTitle('You do not have a private venting session to cancel!')
                    .setDescription('You currently do not have a pending private venting session, so no action has been taken (:');

                return this.client.utils.sendDM(msg.author, requestedEmbed);
            }

            cancelledEmbed
                .setThumbnail(msg.author.avatarURL())
                .setAuthor(msg.author.username, msg.author.avatarURL())
                .setTitle(`${msg.author.username} has cancelled their private venting session!`)
                .addField('Venter ID', msg.author.id, true)
                .setFooter(`Session ID: ${privateVent.id}`, this.client.server.iconURL());

            this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just cancelled their private venting session (${privateVent.id})`);
        }

        // Post the embed
        this.client.tvfChannels.staff.support.send(cancelledEmbed);
        this.client.tvfChannels.staff.private.logs.send(cancelledEmbed);

        // Cancel the session
        this.clearTimeouts(privateVent);
        this.client.db.deletePrivate(privateVent.id);
	}
}

module.exports = PrivateCancel;
export default PrivateCancel;
