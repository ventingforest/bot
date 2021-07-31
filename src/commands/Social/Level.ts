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
			'level @newt guillén <3'
		];
	}

	async exec(msg: Message, { argMember }: { argMember: GuildMember }) {
		const member = argMember || msg.member;
		const users = await this.client.db.user.findMany({ orderBy: { xp: 'desc' }});
		const user = users.find(u => u.id === member.id);
		const rank = users.map(d => d.xp).indexOf(user.xp) + 1;
		const xpForLevel = this.client.social.xpFor(user.level);
		const xpForNext = this.client.social.xpFor(user.level + 1);

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
		ctx.font = this.client.utils.applyText(canvas, 72, member.user.username);
		ctx.fillText(member.user.username, 287.3, 112);

		// Add the user's level and rank
		const levelText = `Level ${user.level} (#${rank})`;
		ctx.font = this.client.utils.applyText(canvas, 36, levelText);
		ctx.fillText(levelText, 287.3, 173);

		// Fill the progress bar
		const percentage = (user.xp - xpForLevel) / (xpForNext - xpForLevel);
		ctx.fillStyle = this.client.constants.Colours.Green;
		ctx.fillRect(287.12, 205.19, 400 * percentage, 31.35);

		// Add the user's profile picture					
		const avatar = await loadImage(member.user.avatarURL({ format: 'jpg' }));
		ctx.drawImage(avatar, 37.35, 46.35, 193.65, 189.99);

		// Create an attachment
		const attachment = this.client.utils.attachment(canvas.toBuffer(), `${msg.author.username}.png`);
		const currentLevelReward = this.client.social.levelReward(user.level);
		const nextLevelReward = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(currentLevelReward) + 1];
		const beginning = member === msg.member ? 'You are' : `${member.user.username} is`;

		msg.channel.send(`**${this.client.constants.Emojis.Confetti}  |** ${nextLevelReward ? ` ${beginning} ${(this.client.social.xpFor(nextLevelReward.level) - user.xp).toLocaleString()} xp away from **${nextLevelReward.name}!**` : ''} ${beginning} currently a **${currentLevelReward.name}**.`, attachment);

		this.client.logger.command(`${this.client.userLogCompiler(msg.author)} requested ${member === msg.member ? 'their' : `${this.client.userLogCompiler(member.user)}'s`} rank card.`);
	}
}

module.exports = Level;
export default Level;
