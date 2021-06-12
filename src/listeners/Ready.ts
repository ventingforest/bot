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
		// Load constants
		this.client.constants = Constants(this.client.server);
		this.client.logger.info('TVF Bot is ready!');
	}
}

module.exports = Ready;
