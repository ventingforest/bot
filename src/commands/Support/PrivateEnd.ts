import { Command } from 'discord-akairo';
import { Message, TextChannel, VoiceChannel, User, GuildMember } from 'discord.js';
import { stripIndents } from 'common-tags';
import moment from 'moment';
import ms from 'ms';
import { Private } from '@prisma/client';

class PrivateEnd extends Command {
	constructor() {
		super('privateEnd', {
			aliases: ['privateVent-end', 'pve'],
			description: 'Allows members of staff to end a privateVent venting session!',
            args: [
                {
					id: 'memberTag',
					type: 'member',
					index: 0,
                    prompt: {
                        start: (msg: Message): string => `${msg.author}, what is the ID of the user whose session you would like to end?`
                    }
				},
                {
                    id: 'notes',
                    type: 'string',
                    match: 'rest',
                    default: 'No notes provided.'
                }
            ]
		});

		this.usage = 'privateVent-end <id> [notes]';
		this.examples = [
			'privateVent-end',
			'privateVent-end @newt guillén <3#1234',
            'privateVent-end 326767126406889473 Something important to remember about the session for next time might go here - this will not be saved, just displayed in the ending embed.'
		];
	}

    /**
     * Ends a private venting session.
     * @param privateVent The private venting session
     * @param staff The member of staff who ended the session
     * @param notes Notes to end the session with
     */
    async endSession(privateVent: Private, staff: User, notes: string) {
        const text = this.client.server.channels.cache.get(privateVent.textID) as TextChannel;
        const voice = this.client.server.channels.cache.get(privateVent.voiceID) as VoiceChannel;
        const startedAt = moment(privateVent.startedAt).format(this.client.constants.moment);
        const endedAt = moment().format(this.client.constants.moment);
        const messages = text.messages.cache;
        const user = await this.client.users.fetch(privateVent.id);

        // Upload the message history to pastebin
        const paste = await this.client.pastebin.pastes.create(stripIndents`
            Venter: ${user.tag} (${user.id})
            Reason for vent: ${privateVent.reason}
            Started at: ${startedAt}
            Ended at: ${endedAt}
            Recorded message count: ${messages.size}
            ---------------------------------------------
            ${messages.map(msg => `${moment(msg.createdTimestamp).format('D/M/YYYY HH:MM')} ${msg.author.tag}: ${msg.content}`).join('\n')}
        `, {
            title: `privateVent Venting: ${user.tag} // ${endedAt}`,
            privacy: 1
        });

        // Announce
        const embed = this.client.utils.embed()
			.setColor(this.client.constants.colours.red)
			.setThumbnail(user.avatarURL())
            .setAuthor(staff.username, staff.avatarURL())
            .setTitle(`${user.username}'s session has ended (:`)
            .setDescription(notes)
            .addField('Reason for session', privateVent.reason)
            .addField('Open for', ms(moment().diff(moment(privateVent.startedAt), 'ms'), { long: true }))
            .addField('Started at', startedAt, true)
            .addField('Ended at', endedAt, true)
            .addField('Pastebin', paste.url ? paste.url : 'Max daily paste upload limit met ):', true);

        this.client.tvfChannels.staff.support.send(embed);
        this.client.tvfChannels.staff.private.logs.send(embed);

        // Delete the associated channels
        await text.delete();
        await voice.delete();

        // Delete the private venting session
        this.client.db.deletePrivate(privateVent.id);

        this.client.logger.command(`${this.client.userLogCompiler(staff)} just ended ${this.client.userLogCompiler(user)}'s privateVent venting session (${privateVent.id})`);
    }

	async exec(msg: Message, { memberTag, notes }: { memberTag: GuildMember, notes: string }) {
        this.client.utils.deletePrompts(msg); // Delete any prompts
		const privateVent = await this.client.db.private.findUnique({ where: { id: memberTag.id }}); // Get the user's document

		if (!privateVent) {
			const error = this.client.utils.embed()
				.setColor(this.client.constants.colours.red)
                .setThumbnail(this.client.server.iconURL())
                .setAuthor(msg.author.username, msg.author.avatarURL())
				.setTitle('There was an error trying to end that privateVent venting session!')
				.setDescription(`An active privateVent venting session could not be found with the ID \`${memberTag.id}\`. Please check that you have entered it exactly as shown in the request, and try again (IDs are cAsE sensitive!)`);

			return msg.channel.send(error);
		}

        // End the session
        this.endSession(privateVent, msg.author, notes);
	}
}

module.exports = PrivateEnd;
export default PrivateEnd;
