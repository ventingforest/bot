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
		if (this.client.production) {
            this.client.tvfChannels.general.send(`**${user.tag}** has been unbanned from the Forest.`);
        }
	}
}

module.exports = MemberUnban;
