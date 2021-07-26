import { Command } from 'discord-akairo';
import { Message, Collection, GuildMember } from 'discord.js';
import pluralise from 'pluralize';

class Staff extends Command {
	constructor() {
		super('staff', {
			aliases: ['staff'],
			category: 'Core',
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

    private generateEmbed(members: Collection<string, GuildMember>, colour: string, name: string) {
        const online = members.filter(m => m.user.presence.status !== 'offline').size;

        return this.client.utils.embed()
            .setColor(colour)
            .setThumbnail(this.client.server.iconURL())
            .setTitle(`${name} (${members.size})`)
            .setDescription(members.map(m => m.user))
            .addField('Online', online);
    }

	exec(msg: Message, { position }: { position: string }) {
        // Roles and their members
        const admins = this.client.tvfRoles.staff.admins.members;
        let support = this.client.tvfRoles.staff.support.members;
        let moderators = this.client.tvfRoles.staff.moderators.members;
        const staff = this.client.tvfRoles.staff.staff.members;

        support = support.filter(m => !support.intersect(admins).has(m.id)).filter(m => !moderators.intersect(support).has(m.id));
        moderators = moderators.filter(m => !moderators.intersect(admins).has(m.id));

        const fullList = this.client.utils.embed()
            .setColor(this.client.constants.colours.green)
            .setTitle(`Staff (${staff.size})`)
            .setThumbnail(this.client.server.iconURL())
            .addField(`Administrators (${admins.size})`, admins.map(a => a.user), true)
            .addField(`Forest Keepers (${moderators.size})`, moderators.map(m => m.user), true)
            .addField(`Support (${support.size})`, support.map(s => s.user), true)
            .addField('Online', staff.filter(s => s.user.presence.status !== 'offline').size);

        if (position) {
            switch (pluralise(position)) {
                case 'administrators':
                case 'admins': 
                    msg.channel.send(this.generateEmbed(admins, this.client.constants.colours.yellow, 'Administrators'));
                    break;

                case 'supports':
                    msg.channel.send(this.generateEmbed(support, this.client.tvfRoles.staff.support.hexColor, 'Support'));
                    break;

                case 'forest keepers':
                case 'moderators':
                case 'mods':
                case 'fks':
                    msg.channel.send(this.generateEmbed(moderators, this.client.tvfRoles.staff.moderators.hexColor, 'Forest Keepers'));
                    break;

                default:
                    msg.channel.send(fullList);
                    break;
            }
        } else {
            msg.channel.send(fullList);
        }

        this.client.logger.command(`${this.client.userLogCompiler(msg.author)} requested a list of staff.`);
	}
}

module.exports = Staff;
export default Staff;
