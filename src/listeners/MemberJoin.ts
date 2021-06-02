import { stripIndents } from 'common-tags';
import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import User from '../models/user';
import ordinal from 'ordinal';
import Isolate from '../commands/Support/Isolate';

class MemberJoin extends Listener {
	constructor() {
		super('memberJoin', {
			emitter: 'client',
			event: 'guildMemberAdd'
		});
	}

	async exec(member: GuildMember) {
		if (this.client.isProduction) {
			let hereBefore = true;

			if (this.client.botBanner && member.user.bot) return member.ban({ reason: 'Bot banner is enabled (:' });
			else {
				const prefix = this.client.commandHandler.prefix;
				// Try and find a document for the member
				const doc = await User.findOne({ id: member.user.id }, (err, res) => {
					if (err) this.client.logger.error(err);

					// If the document does not exist (first join or unban)
					else if (!res) {
						hereBefore = false;

						// Create a document for them
						User.create({ id: member.user.id });

						// Send a DM welcoming the user
						const dm = this.client.util.embed()
							.setTitle('Welcome to The Venting Forest!')
							.setDescription(`Welcome to TVF! You are our **${ordinal(this.client.joinPosition(member.id))}** member! We are a relatively large venting server that have been operating since the 17th April 2018, and we want to try our best to make you feel right at home! <3`)
							.setColor(this.client.constants.colours.green)
							.setThumbnail(this.client.server.iconURL())
							.addField('I\'m in... so now what?', stripIndents`
                                Now that you have joined our server, there are a couple things that you should know and that you need to do.
                                First off, you must read ${this.client.constants.channels.rules.toString()}, as it contains the majority of what you need to know.
                                You can find out about our staff in ${this.client.constants.channels.meetTheStaff.toString()}.
                                When you are ready, please verify yourself in ${this.client.constants.channels.verification.toString()}!
                                You should then visit ${this.client.constants.channels.roles.toString()}, where you can assign some cool roles to yourself that will allow you to access hidden channels.
                            `)
							.addField('What is private venting?', stripIndents`
                                We provide a service known as private venting, in which you can vent one-on-one with a member of our lovely staff team.

                                You can request one of these sessions using the \`${prefix}private\` command. The format is \`${prefix}private [reason]\`.
                                You may also cancel your session using the \`${prefix}private cancel\` command. Providing a reason is always appreciated.
                            `)
							.addField('How to use our venting channels...', stripIndents`
                                We have seen many people enter our server and going straight to a venting channel to say something along the lines of "is anyone there", not getting a response, and leaving.
                                This is not how we use our venting channels. Please start venting as soon as you enter the channel, and if you want a response quickly, ping the **Helper** role.

                                If you want to DM someone, visit the channel for your topic and ask if anyone can DM with them, and include the topic and any preferences you may have.

                                Please be courteous towards others at all times, and **do not encourage self-harm or suicide**. If you are caught doing this, you will be banned.
                            `)
							.setFooter('The Venting Forest, serving users across the world since the 17th of April 2018.', this.client.server.iconURL());

						this.client.sendDM(member.user, dm);
					}
				});

				if (doc !== null) {
					// If there is sticky roles, add them back
					if (doc.stickyRoles.length > 0) {
						doc.stickyRoles.forEach(r => member.roles.add(r, 'Adding back sticky roles...'));
						doc.stickyRoles = [];
					}

					// If the user was previously isolated, put them back into isolation
					if (doc.isolation.isolated) {
						Isolate.prototype.isolate(member, this.client.user, 'Automatic reisolation!', doc.isolation.channels.text, doc.isolation.channels.vc, doc, this.client);
					}

					// Save the document again
					this.client.saveDoc(doc);
				}
			}

			// Welcome the user to the server
			const welcome = this.client.util.embed()
				.setThumbnail(member.user.avatarURL())
				.setColor(this.client.constants.colours.green)
				.setDescription(stripIndents`
                    This may be a somewhat large server, but we can certainly make you feel at home - that's what our **Welcome Team** is for!
                    **First of all, check out ${this.client.constants.channels.rules.toString()} as it contains much of what you need to know, and ${this.client.constants.channels.roles.toString()}, which you can self-assign.**
                    We hope you have fun and enjoy your stay here at The Venting Forest! ${hereBefore ? 'We missed you <3' : ''}
                `);
            
			if (hereBefore) welcome.setTitle(`Welcome back to TVF, ${member.user.username}!`)
			else welcome.setTitle(`Welcome to TVF, ${member.user.username}!`)

			const msg = await this.client.constants.channels.general.send(`**Welcome ${hereBefore ? 'back' : ''} to TVF, <@!${member.id}>!** ${member.id === '625919227651555348' || member.id === '326767126406889473' || member.user.bot ? '' : `(${this.client.constants.roles.community.welcomeTeam.toString()})`}`, welcome);
			msg.react(this.client.constants.emojis.wave);
		}
	}
}

module.exports = MemberJoin;