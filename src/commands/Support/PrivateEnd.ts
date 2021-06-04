import { Command } from 'discord-akairo';
import { Message, TextChannel, VoiceChannel } from 'discord.js';
import User from '../../models/user';
import { stripIndents } from 'common-tags';
import moment from 'moment';
import ms from 'ms';
import PrivateCancel from '../Venting/PrivateCancel';
import { IUser } from '../../models/user';

class PrivateEnd extends Command {
	constructor() {
		super('privateEnd', {
			aliases: ['private-end', 'pve'],
			category: 'Support',
			description: 'Allows members of staff to end a private venting session!',
            args: [
                {
                    id: 'id',
                    type: 'string',
                    index: 0,
                    prompt: {
                        start: (msg: Message): string => `${msg.author}, what is the ID of the session you would like to start?`
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

		this.usage = 'private-end <id> [notes]';
		this.examples = [
			'private-end',
			'private-end ci1de',
            'private-end ci1de Something important to remember about the session for next time might go here - this will not be saved, just displayed in the ending embed.'
		];
	}

    /**
     * Ends a private venting session.
     * @param doc 
     * @param notes
     */
    async endSession(doc: IUser, notes: string) {
        const text = this.client.server.channels.cache.get(doc.private.channels.text) as TextChannel;
        const voice = this.client.server.channels.cache.get(doc.private.channels.vc) as VoiceChannel;
        const startedAt = moment(doc.private.startedAt).format(this.client.constants.moment);
        const endedAt = moment().format(this.client.constants.moment);
        const messages = text.messages.cache;
        const user = await this.client.users.fetch(doc.id);

        // Upload the message history to pastebin
        const paste = await this.client.pastebin.pastes.create(stripIndents`
            Venter: ${user.tag} (${user.id})
            Reason for vent: ${doc.private.reason}
            Started at: ${startedAt}
            Ended at: ${endedAt}
            Recorded message count: ${messages.size}
            ---------------------------------------------
            ${messages.map(msg => `${moment(msg.createdTimestamp).format('D/M/YYYY HH:MM')} ${msg.author.tag}: ${msg.content}`).join('\n')}
        `, {
            title: `Private Venting: ${user.tag} // ${endedAt}`,
            privacy: 1
        });

        // Announce
        const embed = this.client.util.embed()
			.setColor(this.client.constants.colours.red)
			.setThumbnail(user.avatarURL())
            .setTitle(`${user.username}'s session has ended (:`)
            .setDescription(notes)
            .addField('Reason for session', doc.private.reason)
            .addField('Open for', ms(moment().diff(moment(doc.private.startedAt), 'ms'), { long: true }))
            .addField('Started at', startedAt, true)
            .addField('Ended at', endedAt, true)
            .addField('Pastebin', paste.url ? paste.url : 'Max daily paste upload limit met ):', true);

        this.client.constants.channels.staff.support.send(embed);
        this.client.constants.channels.staff.private.logs.send(embed);

        // Delete the associated channels
        await text.delete();
        await voice.delete();

        // Reset the document values
        PrivateCancel.prototype.cancelSession(doc);
    }

	async exec(msg: Message, { id, notes }: { id: string, notes: string }) {
        this.client.deletePrompts(msg); // Delete any prompts
		const doc = await User.findOne({ 'private.requested': true, 'private.id': id }, (err, res) => err ? this.client.logger.error(err) : res); // Get the user's document
		if (!doc) {
			const error = this.client.util.embed()
				.setColor(this.client.constants.colours.red)
                .setThumbnail(this.client.server.iconURL())
				.setTitle('There was an error trying to end that private venting session!')
				.setDescription(`An active private venting session could not be found with the ID \`${id}\`. Please check that you have entered it exactly as shown in the request, and try again (IDs are cAsE sensitive!)`);
			return msg.channel.send(error);
		}

        // End the session
        await this.endSession(doc, notes);
        await this.client.saveDoc(doc);
	}
}

module.exports = PrivateEnd;
export default PrivateEnd;