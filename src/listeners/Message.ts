import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { createCanvas, registerFont, loadImage } from 'canvas';
import * as path from 'path';
import Level from '../commands/Level';

class MessageListener extends Listener {
	constructor() {
		super('msg', {
			emitter: 'client',
			event: 'message'
		});
	}

	async exec(msg: Message) {
		// Helper ping and relay
		if (msg.content.includes(this.client.constants.roles.community.helper.toString())) {
			// Relay
			const helperEmbed = this.client.util.embed()
				.setColor(this.client.constants.colours.yellow)
				.setThumbnail(this.client.server.iconURL())
				.setTitle(`${msg.author.username} needs help!`)
				.addField('Where?', msg.channel)
				.addField('Message', msg.content)
				.setTimestamp(new Date());

			this.client.constants.channels.community.helper.send(helperEmbed);

			// Helper ping message
			msg.channel.send(`${msg.author} - please wait, a helper will arrive shortly. If it's an emergency, call the number in ${this.client.constants.channels.resources}. You can also request a one-on-one private session with a staff by typing ${this.client.prefix}private in any channel.`)
		}

		// Levelling system		
		if (!this.client.talkedRecently.has(msg.author.id) && this.client.user) {
			const doc = await this.client.userDoc(msg.author.id); // Get the user's document
			doc.xp += Math.floor(Math.random() * 25) + 15; // 15-25 xp per message

			// Level up!
			if (doc.xp >= this.client.xpFor(doc.level + 1)) {
				doc.level++;

				// Register the font
				registerFont(path.join(__dirname, '..', '..', 'assets', 'levels', 'LeagueSpartan.ttf'), { family: 'League Spartan' });

				// Create the canvas
				const canvas = createCanvas(934, 282);
				const ctx = canvas.getContext('2d');

				// Draw the template
				const template = await loadImage(path.join(__dirname, '..', '..', 'assets', 'levels', 'levelup.png'));
				ctx.drawImage(template, 0, 0, 934, 282);

				// Add the user's profile picture					
				const avatar = await loadImage(msg.author.avatarURL({ format: 'jpg' }));
				ctx.drawImage(avatar, 37.35, 46.35, 193.65, 189.99);

				// Add level
				const levelText = `You are now Level ${doc.level}!`;
				ctx.font = Level.prototype.applyText(canvas, 36, levelText);
				ctx.fillStyle = '#ffffff';
				ctx.fillText(levelText, 287.2, 203.8);

				const attachment = this.client.util.attachment(canvas.toBuffer(), `${msg.author.username}.png`);
				const currentLevelReward = this.client.levelReward(doc.level) || this.client.constants.levelRoles[this.client.constants.levelRoles.length - 1];
				const nextLevelReward = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(currentLevelReward) + 1];

				if (doc.level % 2 === 0) {
					msg.author.send(`**${this.client.constants.emojis.confetti}  |** Congratulations! Your magical ability has advanced to **Level ${doc.level}** in The Venting Forest! You are now a **${currentLevelReward.name}**${nextLevelReward ? `, and are ${this.client.xpFor(nextLevelReward.level) - this.client.xpFor(currentLevelReward.level)} xp from becoming a **${nextLevelReward.name}**` : ''}!`, attachment);
				} else {
					msg.author.send(`**${this.client.constants.emojis.confetti}  |** Congratulations! Your magical ability has advanced to **Level ${doc.level}** in The Venting Forest!${nextLevelReward ? ` You are now ${this.client.xpFor(nextLevelReward.level) - this.client.xpFor(currentLevelReward.level)} xp from becoming a **${nextLevelReward.name}**!` : ''} You are currently a **${currentLevelReward.name}**.`, attachment);
				}
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