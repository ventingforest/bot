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
		if (this.client.isProduction) {
            const doc = await this.client.userDoc(member.id); // Get the user's document

            // Save sticky roles
            const staffRoles = Object.entries(this.client.constants.roles.staff).map(r => r[1].id);
            doc.stickyRoles = member.roles.cache.map(r => r.id).filter(r => ![...staffRoles, this.client.server.roles.everyone].includes(r));
            
            // If the user has a pending venting session, clear the expiries and cancel the session
            if (doc.private.requested) {
                PrivateCancel.prototype.clearTimeouts(doc);
                PrivateCancel.prototype.cancelSession(doc);
            }

            // If the user is in a private venting session, end it
            if (doc.private.startedAt && doc.private.startedAt !== null) {
                PrivateEnd.prototype.endSession(doc, 'The user has left the server.');
            }

            this.client.saveDoc(doc);

            // Send goodbye message
            this.client.constants.channels.general.send(`**${member.user.tag}** has exited the Forest.`);
	    }
    }
}

module.exports = MemberLeave;