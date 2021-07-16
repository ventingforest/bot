import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import PrivateEnd from '../commands/Support/PrivateEnd';
import PrivateCancel from '../commands/Venting/PrivateCancel';

class MemberLeave extends Listener {
	constructor() {
		super('memberLeave', {
			emitter: 'client',
			event: 'guildMemberRemove'
		});
	}

	async exec(member: GuildMember) {
		if (this.client.production) {
            const user = await this.client.db.getUser(member.id); // Get the user's row
            const privateVent = await this.client.db.getPrivate(member.id); // Get the user's pv session

            // Save sticky roles
            const staffRoles = Object.entries(this.client.tvfRoles.staff).map(r => r[1].id);

            // If the user has a pending venting session, clear the expiries and cancel the session
            if (privateVent) {
                PrivateCancel.prototype.clearTimeouts(privateVent);
                this.client.db.deletePrivate(privateVent.id);
            }

            // If the user is in a private venting session, end it
            if (privateVent.startedAt && privateVent.startedAt !== null) {
                PrivateEnd.prototype.endSession(privateVent, this.client.user, 'The user has left the server.');
            }

            this.client.db.updateUser(user.id, {
                stickyRoles: member.roles.cache.map(r => r.id).filter(r => ![...staffRoles, this.client.server.roles.everyone].includes(r))
            })

            // Send goodbye message
            this.client.tvfChannels.general.send(`**${member.user.tag}** has exited the Forest.`);
	    }
    }
}

module.exports = MemberLeave;
