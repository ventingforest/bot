import { Listener } from 'discord-akairo';
import Constants from '../Constants';

class Ready extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	exec() {
		// Load Constants
		this.client.constants = Constants(this.client.server);

		// Change status
		this.client.user.setActivity('out for you (:', { type: 'WATCHING' });
		this.client.logger.info('TVF Bot is ready!');
	}
}

module.exports = Ready;
