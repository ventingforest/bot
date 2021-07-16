import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

class Blacklist extends Inhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist',
			priority: 1
		});
	}

	async exec(msg: Message) {
		const blacklisted = await this.client.db.blacklist.findMany();
		return blacklisted.map(u => u.id).includes(msg.author.id);
	}
}

module.exports = Blacklist;
export default Blacklist;
