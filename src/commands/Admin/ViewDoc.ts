import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import moment from 'moment';

class ViewDoc extends Command {
	constructor() {
		super('viewDoc', {
			aliases: ['view-doc', 'document', 'view-document'],
			description: 'Renders a user\'s document.',
			args: [
				{
                    id: 'member',
                    type: 'member',
                    index: 0,
                    prompt: {
						start: (msg: Message): string => `Whose document would you like to render?`
					}
                },
			]
		});

		this.usage = 'viewDoc <@user>';
		this.examples = ['viewDoc @newt guillén <3'];
	}

	async exec(msg: Message, { member }: { member: GuildMember }) {
		const doc = await this.client.db.getUser(member.id);
		const privateVent = await this.client.db.getPrivate(member.id);
		const embed = this.client.utils.embed()
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setTitle(member.user.tag)
			.setThumbnail(member.user.avatarURL())
			.setColor(this.client.constants.colours.green)
			.addField('ID', doc.id, true)
			.addField('Level', doc.level.toLocaleString(), true)
			.addField('XP', doc.xp.toLocaleString(), true)
			.addField('Private Vent?', privateVent ? 'True' : 'False', true);

		// If the user has a private venting session
		if (privateVent) {
			const requestedAt = moment(privateVent.requestedAt).format(this.client.constants.moment);
			const startedAt = moment(privateVent.startedAt).format(this.client.constants.moment);
			const text = this.client.server.channels.cache.get(privateVent.textID);
			const voice = this.client.server.channels.cache.get(privateVent.voiceID);

			embed
				.addField('Private Vent ID', privateVent.id, true)
				.addField('Private Vent Requested At', privateVent.requestedAt ? requestedAt : 'Unavailable.', true)
				.addField('Private Vent Started At', privateVent.startedAt ? startedAt : 'Unavailable.', true)
				.addField('Private Vent Text', text, true)
				.addField('Private Vent Voice', voice, true)
				.addField('Private Vent Reason', privateVent.reason);
		}

		// If the user has sticky roles
		if (doc.stickyRoles.length > 0) {
			embed.addField('Sticky Roles', doc.stickyRoles.map(r => this.client.server.roles.cache.get(r)));
		}

		msg.channel.send(embed);
	}
}

module.exports = ViewDoc;
export default ViewDoc;
