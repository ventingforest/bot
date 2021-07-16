import { Listener } from 'discord-akairo';
import TVFRoles from '../TVFRoles';
import TVFChannels from '../TVFChannels';

class Ready extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	exec() {
		// Load constants
		this.client.tvfRoles = TVFRoles(this.client.server);
		this.client.tvfChannels = TVFChannels(this.client.server);

		// Ensure all documents exist
		this.client.server.members.cache.forEach(async member => member.user.bot ? null : await this.client.db.getUser(member.id));		

		this.client.logger.info('TVF Bot is ready!');
	}
}

module.exports = Ready;
