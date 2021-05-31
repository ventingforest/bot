import { createCanvas, registerFont, loadImage } from 'canvas';
import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';
import * as path from 'path';

class Level extends Command {
	constructor() {
		super('level', {
			aliases: ['level', 'rank'],
			category: 'Core',
			description: 'Checks the level of someone!',
			args: [
				{
					id: 'argMember',
					type: 'member',
					index: 0       
				}
			]
		});

		this.usage = 'level [@user]';
		this.examples = [
			'level',
			'level @newt <3#1234'
		];
	}

	async exec(msg: Message, { argMember }: { argMember: GuildMember }) {
		const member = argMember || msg.member;
		const doc = await this.client.userDoc(member.id);
		const rank = await this.client.rankInServer(member.id);
		const xpForLevel = this.client.xpFor(doc.level);
		const xpForNext = this.client.xpFor(doc.level + 1);

		// Register the font
		registerFont(path.join(__dirname, '..', '..', 'assets', 'levels', 'LeagueSpartan.ttf'), { family: 'League Spartan' });

		// Create the canvas
		const canvas = createCanvas(934, 282);
		const ctx = canvas.getContext('2d');

		// Draw the template
		const template = await loadImage(path.join(__dirname, '..', '..', 'assets', 'levels', 'template.png'));
		ctx.drawImage(template, 0, 0, 934, 282);

		// Add the user's name
		ctx.font = '53px "League Spartan"';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(member.user.username, 218, 100, 405);

		// Add the user's level and rank
		ctx.font = '33px "League Spartan"';
		ctx.fillText(`Level ${doc.level} (#${rank})`, 218, 150, 405)

		// Fill the progress bar
		const percentage = (doc.xp - xpForLevel) / (xpForNext - xpForLevel);
		ctx.fillStyle = this.client.constants.colours.green;
		ctx.fillRect(218, 180, 405 * percentage, 43);

		// Add the user's profile picture
		const avatar = await loadImage(member.user.avatarURL({ format: 'jpg' }));

		ctx.beginPath();
		ctx.arc(120, 135, 85, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		ctx.drawImage(avatar, 35, 50, 170, 170);

		// Create an attachment
		const attachment = this.client.util.attachment(canvas.toBuffer(), `${msg.author.username}.png`);
		const currentLevelReward = this.client.levelReward(doc.level);
		const nextLevelReward = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(currentLevelReward) + 1];
                
		msg.channel.send(`**${this.client.constants.emojis.confetti}  |**  You are ${this.client.formatNumber(this.client.xpFor(nextLevelReward.level) - doc.xp)} xp away from **${nextLevelReward.name}!** You are currently a **${currentLevelReward.name}**.`, attachment);
	}
}

module.exports = Level;
