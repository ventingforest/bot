import { createCanvas, registerFont, loadImage } from 'canvas';
import * as Discord from 'discord.js';

export default {
	name: 'level',
    description: 'Checks someone\'s level!',
    aliases: ['rank'],
    args: false,
    usage: 'level [@user]',
	allowGeneral: false,
	run: async (tvf, msg, args) => {
        const member = msg.mentions.members.first() || msg.guild.member(msg.author); // find a member in the command
        const doc = await tvf.userDoc(member.id); // get the member's document
        const rank = await tvf.rankInServer(member.id); // figure out the member's rank
        const xpForLevel = tvf.xpFor(doc.level); // xp for the level the member is on
        const xpForNextLevel = tvf.xpFor(doc.level + 1); // xp for the level the member is going to reach

        // register league spartan as a font
        registerFont(`${__dirname}/../../../assets/fonts/LeagueSpartan.ttf`, { family: 'League Spartan'});

        // create the image
        const canvas = createCanvas(934, 282);
        const ctx = canvas.getContext('2d');

        // make the background
        ctx.fillStyle = '#23272a';
        ctx.fillRect(0, 0, 934, 282);

        // content rectangle
        ctx.fillStyle = '#090a0b';
        ctx.fillRect(20, 30, 894, 222);

        // add the user's profile picture
        const avatar = await loadImage(member.user.avatarURL({ format: 'jpg' }));
        ctx.drawImage(avatar, 60, 50, 175, 175);

        // draw the user's username
        ctx.font = '40px "League Spartan"';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(member.user.tag, 265, 85, 674);

        // draw the user's level and rank
        ctx.font = '25px "League Spartan"';
        ctx.fillText(`Level ${doc.level} (#${rank})`, 265, 135, 674);

        // draw a progress bar
        ctx.fillRect(265, 175, 625, 29);

        ctx.font = '15px "League Spartan"';
        ctx.fillText(tvf.formatNumber(xpForLevel), 265, 230, 674);
        ctx.textAlign = 'right';
        ctx.fillText(tvf.formatNumber(xpForNextLevel), 890, 230);

        // fill the progress bar
        const percentage = (doc.xp - xpForLevel) / (xpForNextLevel - xpForLevel);
        ctx.fillStyle = tvf.const.green;
        ctx.fillRect(265, 175, 625 * percentage, 29)

        // create an attachment
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `${msg.author.username}.png`);
        
        msg.channel.send(`You are level ${doc.level}, with ${tvf.formatNumber(doc.xp)}xp.`, attachment);
	}
} as Command;
