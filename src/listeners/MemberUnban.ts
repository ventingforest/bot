import { Listener } from 'discord-akairo';
import { Guild, User } from 'discord.js';

class MemberUnban extends Listener {
	constructor() {
		super('memberUnban', {
			emitter: 'client',
			event: 'guildBanRemove',
		});
	}

	exec(_guild: Guild, user: User) {
		if (this.client.isProduction) {
            this.client.constants.channels.general.send(`**${user.tag}** has been unbanned from the Forest.`);
        }
	}
}

module.exports = MemberUnban;