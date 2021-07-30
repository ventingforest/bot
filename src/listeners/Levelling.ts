import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { createCanvas, registerFont, loadImage } from 'canvas';
import * as path from 'path';

class Levelling extends Listener {
	constructor() {
		super('msg', {
			emitter: 'client',
			event: 'message'
		});
	}

	async exec(msg: Message) {
		if (this.client.production && !this.client.social.xpCooldown.has(msg.author.id)) {
			const user = await this.client.db.user.findUnique({ where: { id: msg.author.id }});
			const newXp = Math.floor(Math.random() * 25) + 15;
			let level = user.level;

			// Level up!
			if (newXp >= this.client.social.xpFor(level + 1)) {
				level++;

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
				const levelText = `You are now Level ${user.level}!`;
				ctx.font = this.client.utils.applyText(canvas, 36, levelText);
				ctx.fillStyle = '#ffffff';
				ctx.fillText(levelText, 287.2, 203.8);

				const attachment = this.client.utils.attachment(canvas.toBuffer(), `${msg.author.username}.png`);
				const currentLevelReward = this.client.social.levelReward(user.level) || this.client.constants.levelRoles[this.client.constants.levelRoles.length - 1];
				const nextLevelReward = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(currentLevelReward) + 1];

				if (user.level % 2 === 0) {
					msg.author.send(`**${this.client.constants.emojis.confetti}  |** Congratulations! Your magical ability has advanced to **Level ${user.level}** in The Venting Forest! You are now a **${currentLevelReward.name}**${nextLevelReward ? `, and are ${this.client.social.xpFor(nextLevelReward.level) - this.client.social.xpFor(currentLevelReward.level)} xp from becoming a **${nextLevelReward.name}**` : ''}!`, attachment);
				} else {
					msg.author.send(`**${this.client.constants.emojis.confetti}  |** Congratulations! Your magical ability has advanced to **Level ${user.level}** in The Venting Forest!${nextLevelReward ? ` You are now ${this.client.social.xpFor(nextLevelReward.level) - this.client.social.xpFor(currentLevelReward.level)} xp from becoming a **${nextLevelReward.name}**!` : ''} You are currently a **${currentLevelReward.name}**.`, attachment);
				}
			}

			await this.client.db.user.update({
				where: { id: user.id }, 
				data: {
					xp: newXp,
					level
				}
			});

			if (level % 2 === 0 && level <= 100) {
				const newRole = this.client.constants.levelRoles.find(r => r.level === user.level);
				const oldRole = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(newRole) - 1];
				const member = msg.guild.member(msg.author.id);
				
				if (user.level !== 2) member.roles.remove(oldRole.roleID, `Levelled up to ${newRole.level}!`);
				member.roles.add(newRole.roleID, `Levelled up to ${newRole.level}!`);
			}

			// Put them on timeout for a minute
			this.client.social.xpCooldown.add(msg.author.id);
			setTimeout(() => this.client.social.xpCooldown.delete(msg.author.id), 60000);
		}
	}
}

module.exports = Levelling;
