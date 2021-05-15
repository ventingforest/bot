import { Listener } from 'discord-akairo';

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	exec() {
		this.client.user.setActivity('out for you (:', { type: 'WATCHING' });
		console.log('TVF Bot is ready!');
	}
}

module.exports = ReadyListener;
