import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import pluralise from 'pluralize';

class Staff extends Command {
	constructor() {
		super('staff', {
			aliases: ['staff'],
			category: '',
			description: 'Allows you to view stats about our wonderful staff! <3',
            args: [
                {
                    id: 'position',
                    type: 'lowercase',
                    match: 'rest'
                }
            ]
		});

		this.usage = 'staff [position]';
		this.examples = [
            'staff',
            'staff Admin',
            'staff Forest Keepers'
        ];
	}

	exec(msg: Message, { position }: { position: string }) {
        const embed = this.client.util.embed()
            .setThumbnail(this.client.server.iconURL());
        if (position) position = pluralise(position);
        let online: number = 0;

        // Roles and their members
        const admins = this.client.constants.roles.staff.admins.members;
        const engagement = this.client.constants.roles.staff.engagement.members;
        const support = this.client.constants.roles.staff.support.members;
        const moderators = this.client.constants.roles.staff.support.members;
        const staff = this.client.constants.roles.staff.staff.members;

        if (position === 'administrators' || position === 'admins') {
            online = admins.filter(a => a.user.presence.status !== 'offline').size;

            embed
                .setColor(this.client.constants.colours.yellow)
                .setTitle(`Administrators (${admins.size})`)
                .setDescription(admins.map(a => a.user))
        } else if (position === 'engagements') {
            online = engagement.filter(e => e.user.presence.status !== 'offline').size;

            embed
                .setColor(this.client.constants.roles.staff.engagement.hexColor)
                .setTitle(`Engagement (${engagement.size})`)
                .setDescription(engagement.map(e => e.user));
        } else if (position === 'supports') {
            online = support.filter(s => s.user.presence.status !== 'offline').size;

            embed
                .setColor(this.client.constants.roles.staff.support.hexColor)
                .setTitle(`Support (${support.size})`)
                .setDescription(support.map(s => s.user));
        } else if (position === 'forest keepers' || position === 'moderators' || position === 'mods' || position === 'fks') {
            online = moderators.filter(m => m.user.presence.status !== 'offline').size;

            embed
                .setColor(this.client.constants.roles.staff.moderators.hexColor)
                .setTitle(`Forest Keepers (${moderators.size})`)
                .setDescription(moderators.map(m => m.user));
        } else {
            online = staff.filter(s => s.user.presence.status !== 'offline').size;

            embed
                .setColor(this.client.constants.colours.green)
                .setTitle(`Staff (${staff.size})`)
                .addField(`Administrators (${admins.size})`, admins.map(a => a.user), true)
                .addField(`Forest Keepers (${moderators.size})`, moderators.map(m => m.user), true)
                .addField(`Engagement (${engagement.size})`, engagement.map(e => e.user), true)
                .addField(`Support (${support.size})`, support.map(s => s.user), true);
        }

        embed.addField('Online', online);
        msg.channel.send(embed);
	}
}

module.exports = Staff;