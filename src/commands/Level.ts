import { createCanvas, registerFont, loadImage } from 'canvas';
import { Command } from 'discord-akairo';
import { Message, MessageAttachment, GuildMember } from 'discord.js';
import * as path from 'path';

class PingCommand extends Command {
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
                console.log(argMember);
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
                const attachment = new MessageAttachment(canvas.toBuffer(), `${msg.author.username}.png`);
                const currentLevelReward = this.client.constants.levelRoles.find(r => r.level === Math.floor(doc.level / 2) * 2).name;
                const nextLevelReward = doc.level === Math.ceil(doc.level / 2) * 2 ? doc.level + 2 : Math.ceil(doc.level / 2) * 2;
                
                msg.channel.send(`**${this.client.constants.emojis.confetti}  |**  You are ${this.client.formatNumber(this.client.xpFor(nextLevelReward) - doc.xp)} xp away from **${this.client.constants.levelRoles.find(r => r.level === nextLevelReward).name}!** You are currently a **${currentLevelReward}**.`, attachment);
        }
}

module.exports = PingCommand;
