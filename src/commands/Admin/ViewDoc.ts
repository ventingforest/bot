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
						start: (msg: Message): string => `${msg.author}, whose document would you like to render?`
					}
                },
			]
		});

		this.usage = 'viewDoc <@user>';
		this.examples = ['viewDoc @newt <3#1234'];
	}

	async exec(msg: Message, { member }: { member: GuildMember }) {
		const doc = await this.client.userDoc(member.id);
		const embed = this.client.util.embed()
			.setAuthor(msg.author.username, msg.author.avatarURL())
			.setTitle(member.user.tag)
			.setThumbnail(member.user.avatarURL())
			.setColor(this.client.constants.colours.green)
			.addField('ID', doc.id, true)
			.addField('Level', this.client.formatNumber(doc.level), true)
			.addField('XP', this.client.formatNumber(doc.xp), true)
			.addField('Private Vent Requested?', doc.private.requested ? 'True' : 'False', true);

		if (doc.private.requested) {
			const requestedAt = moment(doc.private.requestedAt).format(this.client.constants.moment);
			const startedAt = moment(doc.private.startedAt).format(this.client.constants.moment);
			const text = this.client.server.channels.cache.get(doc.private.channels.text);
			const voice = this.client.server.channels.cache.get(doc.private.channels.vc);

			embed
				.addField('Private Vent ID', doc.private.id, true)
				.addField('Private Vent Requested At', doc.private.requestedAt ? requestedAt : 'Unavailable.', true)
				.addField('Private Vent Started At', doc.private.startedAt ? startedAt : 'Unavailable.', true)
				.addField('Private Vent Text', text, true)
				.addField('Private Vent Voice', voice, true)
				.addField('Private Vent Reason', doc.private.reason);
		}
		
		embed.addField('Isolated?', doc.isolation.isolated ? 'True' : 'False', true);

		if (doc.isolation.isolated) {
			const isolatedAt = moment(doc.isolation.isolatedAt).format(this.client.constants.moment);
			const text = this.client.server.channels.cache.get(doc.isolation.channels.text);
			const voice = this.client.server.channels.cache.get(doc.isolation.channels.vc);

			embed
				.addField('Isolated At', doc.isolation.isolatedAt ? isolatedAt : 'Unavailable.', true)
				.addField('Isolated by', this.client.server.member(doc.isolation.isolatedBy).user.tag, true)
				.addField('Isolation Text', text, true)
				.addField('Isolation Voice', voice, true)
				.addField('Isolation Reason', doc.isolation.reason, true);
		}

		if (doc.stickyRoles.length > 0) {
			embed.addField('Sticky Roles', doc.stickyRoles.map(r => this.client.server.roles.cache.get(r)));
		}

		msg.channel.send(embed);
	}
}

module.exports = ViewDoc;
export default ViewDoc;
