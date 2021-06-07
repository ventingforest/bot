import { Command, AkairoClient } from 'discord-akairo';
import { Message, User, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import { IUser } from '../../models/user';
import moment from 'moment';

class Isolate extends Command {
    constructor() {
		super('isolate', {
			aliases: ['isolate'],
			description: 'Allows staff to isolate a user!',
            args: [
                {
                    id: 'member',
                    type: 'member',
                    index: 0,
                    prompt: {
                        start: (msg: Message): string => `${msg.author}, who would you like to isolate?`
                    }
                },
                {
                    id: 'reason',
                    type: 'string',
                    match: 'rest'
                }
            ]
		});

		this.usage = 'isolate <@user> [reason]';
		this.examples = [
            'isolate @newt <3#1234',
            'isolate @newt <3#1234 Let\'s calm things down a bit, shall we?'
        ];
	}

    /**
     * Isolates a user
     * @param isolated
     * @param isolator
     * @param reason
     * @param textID
     * @param voiceID
     * @param doc
     * @param client
     */
    async isolate(isolated: GuildMember, isolator: User, reason: string, textID: string, voiceID: string, doc: IUser, client: AkairoClient) {
        const text = client.server.channels.cache.get(textID) as TextChannel;
        const voice = client.server.channels.cache.get(voiceID) as VoiceChannel;
        const { user } = isolated;
        const welcomeEmbed = client.util.embed()
            .setThumbnail(user.avatarURL())
            .setColor(client.constants.colours.green)
            .setTitle(`Hey ${user.username} <3`);

        // Inform staff
        const isolatedEmbed = client.util.embed()
            .setColor(client.constants.colours.red)
            .setAuthor(isolator.username, isolator.avatarURL())
            .setThumbnail(user.avatarURL());
        
        if (doc.isolation.isolated) {
            isolatedEmbed
                .setTitle(`${user.username} has been automatically reisolated!`)
                .addField('Isolated by', client.user.username, true)
                .addField('Originally isolated at', moment(doc.isolation.isolatedAt).format(client.constants.moment), true)
                .addField('Reisolated at', moment().format(client.constants.moment), true);
        } else {
            isolatedEmbed
                .setTitle(`${user.username} has been isolated ):`)
                .addField('Isolated by', isolator.username, true)
                .addField('Isolated at', moment().format(client.constants.moment), true);
        }

        isolatedEmbed.addField('Reason', reason);
        client.constants.channels.staff.moderators.chat.send(isolatedEmbed);
        client.constants.channels.staff.moderators.modlogs.send(isolatedEmbed);
        client.constants.channels.staff.support.send(isolatedEmbed);
        client.constants.channels.staff.isolation.logs.send(isolatedEmbed);

        // Check if they were isolated before
        if (doc.isolation.isolated) {
            text.updateOverwrite(user, { VIEW_CHANNEL: true }, 'Reisolation');
            voice.updateOverwrite(user, { VIEW_CHANNEL: true }, 'Reisolation');
            welcomeEmbed.setDescription('Welcome back to isolation! You were previously isolated when you last left the server, and as a security measure you have been reisolated again. If you feel this is in error, please ping a member of staff and they will be happy to unisolate you (:');
            text.send(`Welcome back to isolation, ${user}`, welcomeEmbed);
            client.constants.channels.general.send(`**${user.username}** is currently isolated! They may not respond to your messages for a while.`);
        } else {
            welcomeEmbed.setDescription('Welcome to isolation! You have been put here by a member of staff - but don\'t worry, this doesn\'t necessarily mean you have done something wrong. Staff put people here in order to help people calm down if they aren\'t feeling the best, or if they are harming other members of the server. Only you and the staff can see this channel, and it is completely private - feel free to talk to them.');
            text.send(`Welcome to isolation, ${user}`, welcomeEmbed);

            // Update the user's document
            doc.isolation.isolated = true;
            doc.isolation.isolatedAt = new Date();
            doc.isolation.isolatedBy = isolator.id;
            doc.isolation.reason = reason;
            doc.isolation.channels.text = text.id;
            doc.isolation.channels.vc = voice.id;

            client.saveDoc(doc);
        }

        // Hide every other channel from the isolated user
        if (isolated.voice) isolated.voice.kick();

        client.server.channels.cache.filter(c => c.id !== text.id && c.id !== voice.id).forEach(c => {
            if (c.type === 'text' || c.type === 'news') {
                c.updateOverwrite(isolated, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
            } else if (c.type === 'voice') {
                c.updateOverwrite(isolated, { VIEW_CHANNEL: false, CONNECT: false });
            }
        });
    }

	async exec(msg: Message, { member, reason }: { member: GuildMember, reason: string }) {
        this.client.deletePrompts(msg);
        msg.delete();
        if (!reason) reason = 'No reason specified.';
        const { user } = member;
        const doc = await this.client.userDoc(user.id);
        
        // Create a channel and vc for the isolated user
        const text = await this.client.server.channels.create(`${user.username}-${user.discriminator}`, {
            parent: this.client.constants.channels.staff.isolation.category,
            type: 'text',
            topic: `${this.client.constants.emojis.tick}  |  Session started: ${moment(doc.isolation.isolatedAt).format(this.client.constants.moment)}`,
            permissionOverwrites: [
                {
                    id: this.client.server.roles.everyone,
                    allow: ['READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'],
                    deny: ['VIEW_CHANNEL', 'ADD_REACTIONS', 'SEND_TTS_MESSAGES']
                },
                {
                    id: this.client.constants.roles.staff.support,
                    allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
                },
                {
                    id: this.client.constants.roles.staff.moderators,
                    allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
                },
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL']
                }
            ]
        });

        const voice = await this.client.server.channels.create(user.tag, {
            parent: this.client.constants.channels.staff.isolation.category,
            type: 'voice',
            permissionOverwrites: [
                {
                    id: this.client.server.roles.everyone,
                    allow: ['CONNECT', 'SPEAK', 'STREAM'],
                    deny: 'VIEW_CHANNEL'
                },
                {
                    id: this.client.constants.roles.staff.support,
                    allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
                },
                {
                    id: this.client.constants.roles.staff.moderators,
                    allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
                },
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL']
                }
            ],
        });

        this.isolate(member, msg.author, reason, text.id, voice.id, doc, this.client);
        this.client.logger.command(`${this.client.userLogCompiler(msg.author)} just isolated ${this.client.userLogCompiler(member.user)} for ${reason}.`);
	}
}

module.exports = Isolate;
export default Isolate;