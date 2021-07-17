import { Listener } from 'discord-akairo';
import TVFRoles from '../TVFRoles';
import TVFChannels from '../TVFChannels';
import moment from 'moment';
import PrivateRequest from '../commands/Venting/PrivateRequest';
import TVFClient from '../struct/TVFClient';

class Ready extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
		});
	}

	async exec() {
		// Load constants
		this.client.tvfRoles = TVFRoles(this.client.server);
		this.client.tvfChannels = TVFChannels(this.client.server);

		// Ensure all documents exist
		this.client.server.members.cache.forEach(async member => member.user.bot ? null : await this.client.db.getUser(member.id));		

		// Ensure all private vents are ticking
		const vents = await this.client.db.private.findMany();
		vents.forEach(v => {
			const expiresAt = moment(v.requestedAt).add(this.client.constants.privateTimeout, 'ms');
			const ms = expiresAt.diff(moment(), 'ms');
			const user = this.client.users.cache.get(v.ownerID);

			console.log(user.tag, expiresAt.format(this.client.constants.moment), ms)

			PrivateRequest.prototype.privateTimeouts(v, user, ms, this.client as TVFClient);
			this.client.logger.db(`Loaded Vent ${v.id} for User ${this.client.userLogCompiler(user)}!`)
		});

		this.client.logger.info('TVF Bot is ready!');
	}
}

module.exports = Ready;
