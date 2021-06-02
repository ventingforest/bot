import { createCanvas, registerFont, loadImage, Canvas } from 'canvas';
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

	applyText(canvas: Canvas, fontSize: number, text: string) {
		const context = canvas.getContext('2d');
	
		do {
			context.font = `${fontSize -= 5}px League Spartan`;
		} while (context.measureText(text).width > canvas.width - 475);

		return context.font;
	};

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
		const template = await loadImage(path.join(__dirname, '..', '..', 'assets', 'levels', 'rank.png'));
		ctx.drawImage(template, 0, 0, 934, 282);

		// Add the user's name
		ctx.fillStyle = '#ffffff';
		ctx.font = this.applyText(canvas, 72, member.user.username);
		ctx.fillText(member.user.username, 287.3, 112);

		// Add the user's level and rank
		const levelText = `Level ${doc.level} (#${rank})`;
		ctx.font = this.applyText(canvas, 36, levelText);
		ctx.fillText(levelText, 287.3, 173);

		// Fill the progress bar
		const percentage = (doc.xp - xpForLevel) / (xpForNext - xpForLevel);
		ctx.fillStyle = this.client.constants.colours.green;
		ctx.fillRect(287.12, 205.19, 400 * percentage, 31.35);

		// Add the user's profile picture					
		const avatar = await loadImage(member.user.avatarURL({ format: 'jpg' }));
		ctx.drawImage(avatar, 37.35, 46.35, 193.65, 189.99);

		// Create an attachment
		const attachment = this.client.util.attachment(canvas.toBuffer(), `${msg.author.username}.png`);
		const currentLevelReward = this.client.levelReward(doc.level);
		const nextLevelReward = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(currentLevelReward) + 1];
		const beginning = member === msg.member ? 'You are' : `${member.user.username} is`;

		msg.channel.send(`**${this.client.constants.emojis.confetti}  |** ${nextLevelReward ? ` ${beginning} ${this.client.formatNumber(this.client.xpFor(nextLevelReward.level) - doc.xp)} xp away from **${nextLevelReward.name}!**` : ''} ${beginning} currently a **${currentLevelReward.name}**.`, attachment);
	}
}

module.exports = Level;
export default Level;