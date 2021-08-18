import TVFCommand from '../../struct/TVFCommand';
import { Message } from 'discord.js';
import timeout from 'timeout';
import { stripIndents } from 'common-tags';
import { Private, User } from '@prisma/client';

class PrivateCancel extends TVFCommand {
    constructor() {
        super('privateCancel', {
            aliases: ['private-cancel', 'pvc'],
            description:
                "Allows you to cancel a private venting session! If you are staff, you may pass an ID to cancel another person's session.",
            args: [
                {
                    id: 'id',
                    type: 'string',
                    index: 0,
                },
            ],
        });

        this.usage = 'private-cancel [id]';
        this.examples = ['private-cancel', 'private-cancel ci1de'];
    }

    /**
     * Clears all related timeouts.
     * @param privateVent
     */
    clearTimeouts(privateVent: Private) {
        // Clear all related timeouts
        timeout.timeout(`${privateVent.id}+0`, null);
        timeout.timeout(`${privateVent.id}+1`, null);
        timeout.timeout(`${privateVent.id}+2`, null);
        timeout.timeout(`${privateVent.id}+3`, null);
        timeout.timeout(`${privateVent.id}+4`, null);
        timeout.timeout(`${privateVent.id}+5`, null);
    }

    async exec(msg: Message, { id }: { id: string }) {
        await msg.delete(); // Delete the user's message for anynomity
        let privateVent: Private;
        let user: User;
        const embed = this.client.utils
            .embed()
            .setAuthor(msg.author.username, msg.author.avatarURL())
            .setColor(this.client.constants.Colours.Red);

        // Check if the user wants to cancel another person's session
        if (id && this.client.utils.isUser('Support', msg.member)) {
            privateVent = await this.client.db.private.findUnique({
                where: { id },
            });
            user = await this.client.db.user.findUnique({
                where: { privateID: privateVent.id },
            });
            const venter = this.client.server.members.cache.get(user.id);
            embed.setThumbnail(venter.user.avatarURL());

            if (!privateVent.startedAt) {
                embed
                    .setTitle(
                        `${msg.author.username} has cancelled ${venter.user.username}'s session`,
                    )
                    .addField('Venter ID', venter.id, true)
                    .setFooter(
                        `Session ID: ${privateVent.id}`,
                        this.client.server.iconURL(),
                    );

                const userEmbed = this.client.utils
                    .embed()
                    .setColor(this.client.constants.Colours.Red)
                    .setThumbnail(this.client.server.iconURL())
                    .setTitle(
                        'A member of the support team has cancelled your private venting session.',
                    )
                    .setDescription(
                        'If you believe this has been done in error, please do not hesitate to contact a member of the support team - or request a new session!',
                    );

                venter.send(userEmbed).catch(() =>
                    this.client.tvfChannels.community.discussion
                        .send(stripIndents`
                    ${venter.user}, your private venting session has been cancelled!
                    Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please consider investigating this.
                    If you believe this has been done in error, don't hesitate to contact a member of staff - or request a new session!
                `),
                );

                this.client.logger.command(
                    `${this.client.userLogCompiler(
                        msg.author,
                    )} just cancelled ${this.client.userLogCompiler(
                        venter.user,
                    )}'s private venting session (${privateVent.id})`,
                );
            } else {
                embed
                    .setTitle('Woops!')
                    .setDescription(
                        `${venter.user.username}'s session has already been started!`,
                    );
                return msg.channel.send(embed);
            }
        }

        // If the user wants to cancel their own session
        else {
            user = await this.client.db.user.findUnique({
                where: { id: msg.author.id },
            });
            privateVent = await this.client.db.private.findUnique({
                where: { id: user.privateID },
            });

            // If the user does not have a requested session
            if (!privateVent || (privateVent && privateVent.startedAt)) {
                const requestedEmbed = this.client.utils
                    .embed()
                    .setColor(this.client.constants.Colours.Red)
                    .setThumbnail(this.client.server.iconURL())
                    .setAuthor(msg.author.username, msg.author.avatarURL())
                    .setTitle(
                        'You do not have a private venting session to cancel!',
                    )
                    .setDescription(
                        'You currently do not have a pending private venting session, so no action has been taken (:',
                    );

                return this.client.utils.sendAndDelete(
                    requestedEmbed,
                    msg.channel,
                );
            }

            embed
                .setThumbnail(msg.author.avatarURL())
                .setTitle(`${msg.author.username} has cancelled their session`)
                .setFooter(
                    `Session ID: ${privateVent.id}`,
                    this.client.server.iconURL(),
                );
        }

        // Post the embed
        this.client.tvfChannels.staff.support.send(embed);
        this.client.tvfChannels.staff.private.logs.send(embed);

        // Cancel the session
        this.clearTimeouts(privateVent);
        await this.client.db.user.update({
            where: { id: user.id },
            data: { privateID: null },
        });
    }
}

module.exports = PrivateCancel;
export default PrivateCancel;
