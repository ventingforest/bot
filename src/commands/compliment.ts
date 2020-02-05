import axios from 'axios';

export const hug: Command = {
	run: async (tvf, msg, args) => {
		// find the mentioned member
		const member = tvf.checkForMember(msg, args).user;

		await msg.delete();

		// make a request for a gif
		const gif = (await axios.get('https://nekos.life/api/pat')).data.url;
		const compliment = tvf.other.COMPLIMENTS[Math.floor(Math.random() * tvf.other.COMPLIMENTS.length)];
		const embed = tvf.createEmbed().setImage(gif).setTitle(compliment).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		// check if the mentioned user is the bot
		if (member === tvf.bot.user) {
			msg.channel.send(tvf.bot.user, embed);
			return msg.reply('aww, thank you 💞');
		}

		return msg.channel.send(member, embed);
	},
	config: {
		name: 'compliment',
		description: 'Compliment another user in the server.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
		allowGeneral: false,
	},
};

export default hug;
