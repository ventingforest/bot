import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

class MessageListener extends Listener {
	constructor() {
		super('msg', {
			emitter: 'client',
			event: 'message'
		});
	}

	async exec(msg: Message) {
		if (!this.client.talkedRecently.has(msg.author.id) && this.client.user) {
			const doc = await this.client.userDoc(msg.author.id); // Get the user's document
			doc.xp += Math.floor(Math.random() * 25) + 15; // 15-25 xp per message

			// Level up!
			if (doc.xp >= this.client.xpFor(doc.level + 1)) {
				doc.level++;
				msg.author.send(`Congratulations! Your magical ability has advanced to **Level ${doc.level}** in The Venting Forest!`);
			}

			this.client.saveDoc(doc);

			if (doc.level % 2 === 0 && doc.level <= 100) {
				const newRole = this.client.constants.levelRoles.find(r => r.level === doc.level);
				const oldRole = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(newRole) - 1];
				const member = msg.guild.member(msg.author.id);
				
				if (doc.level !== 2) member.roles.remove(oldRole.role, `Levelled up to ${newRole.level}!`);
				member.roles.add(newRole.role, `Levelled up to ${newRole.level}!`);
			}

			// Put them on timeout for a minute
			this.client.talkedRecently.add(msg.author.id);
			setTimeout(() => this.client.talkedRecently.delete(msg.author.id), 60000);
		}
	}
}

module.exports = MessageListener;