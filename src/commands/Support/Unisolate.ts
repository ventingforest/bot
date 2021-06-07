import { Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import moment from 'moment';
import ms from 'ms';
import { stripIndents } from 'common-tags';

class Unisolate extends Command {
    constructor() {
		super('unisolate', {
			aliases: ['unisolate'],
			description: 'Allows staff to unisolate a user!',
            args: [
                {
                    id: 'member',
                    type: 'member',
                    index: 0,
                    prompt: {
                        start: (msg: Message): string => `${msg.author}, who would you like to unisolate?`
                    }
                },
                {
                    id: 'notes',
                    type: 'string',
                    match: 'rest'
                }
            ]
		});

		this.usage = 'unisolate <@user> [notes]';
		this.examples = [
            'unisolate @newt <3#1234',
            'unisolate @newt <3#1234 Things have been calmed down!'
        ];
	}

	async exec(msg: Message, { member, notes }: { member: GuildMember, notes: string }) {
        this.client.deletePrompts(msg);
        msg.delete();
        if (!notes) notes = 'No notes specified.';
        const { user } = member;
        const doc = await this.client.userDoc(user.id);
        const isolatedAt = moment(doc.isolation.isolatedAt).format(this.client.constants.moment);
        const unisolatedAt = moment().format(this.client.constants.moment);
        const text = this.client.server.channels.cache.get(doc.isolation.channels.text) as TextChannel;
        const voice = this.client.server.channels.cache.get(doc.isolation.channels.vc) as VoiceChannel;
        const messages = text.messages.cache;

        // Upload the message history to pastebin
        const paste = await this.client.pastebin.pastes.create(stripIndents`
            User isolated: ${user.tag} (${user.id})
            Reason for vent: ${doc.isolation.reason}
            Isolated at: ${isolatedAt}
            Unisolated at: ${unisolatedAt}
            Recorded message count: ${messages.size}
            ---------------------------------------------
            ${messages.map(msg => `${moment(msg.createdTimestamp).format('D/M/YYYY HH:MM')} ${msg.author.tag}: ${msg.content}`).join('\n')}
        `, {
            title: `Isolation: ${user.tag} // ${unisolatedAt}`,
            privacy: 1
        });

        // Give the user access to all the rest of the channels
        this.client.server.channels.cache.forEach(c => {
            const o = c.permissionOverwrites.get(user.id);
            if (o) {
                o.delete();
            }
        });

        // Delete the related channels
        await text.delete();
        await voice.delete();

        // Inform staff
        const isolationEnded = this.client.util.embed()
            .setColor(this.client.constants.colours.red)
            .setThumbnail(user.avatarURL())
            .setTitle(`${user.username} has been unisolated!`)
            .setAuthor(msg.author.username, msg.author.avatarURL())
            .setDescription(notes)
            .addField('Time isolated', ms(moment().diff(moment(doc.isolation.isolatedAt), 'ms'), { long: true}), true)
            .addField('Isolated at', isolatedAt, true)
            .addField('Unisolated at', unisolatedAt, true)
            .addField('Isolated by', this.client.server.member(doc.isolation.isolatedBy).user.username, true)
            .addField('Unisolated by', msg.author.username, true)
            .addField('Recorded message count', messages.size, true)
            .addField('Pastebin', paste.url ? paste.url : 'Max daily paste upload limit met ):', true)
            .addField('Reason for isolation', doc.isolation.reason)
            .addField('Notes', notes);

        this.client.constants.channels.staff.moderators.chat.send(isolationEnded);
        this.client.constants.channels.staff.moderators.modlogs.send(isolationEnded);
        this.client.constants.channels.staff.support.send(isolationEnded);
        this.client.constants.channels.staff.isolation.logs.send(isolationEnded);

        // Update the user's document
        doc.isolation.isolated = false;
        doc.isolation.isolatedAt = null;
        doc.isolation.isolatedBy = null;
        doc.isolation.reason = null;
        doc.isolation.channels.text = null;
        doc.isolation.channels.vc = null;
      
        this.client.saveDoc(doc);

        this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just unisolated ${this.client.userLogCompiler(member.user)}.`);
	}
}

module.exports = Unisolate;
export default Unisolate;