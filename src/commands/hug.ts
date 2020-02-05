import axios from 'axios';

const hug: Command = {
	run: async (tvf, msg, args) => {
		// find the mentioned member
		const member = tvf.checkForMember(msg, args).user;

		await msg.delete();

		// make a request for a gif
		const gif = (await axios.get('https://nekos.life/api/hug')).data.url;
		const embed = tvf.createEmbed().setImage(gif).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		// check if the mentioned user was the author of the message
		if (member === msg.author) {
			return msg.channel.send(embed.setTitle(`${msg.author.username} hugged themselves 🤗`));
		}

		// check if the mentioned user is the bot
		if (member === tvf.bot.user) {
			return msg.channel.send(embed.setTitle(`${msg.author.username} hugged me 🤗💞`));
		}

		return msg.channel.send(embed.setTitle(`${msg.author.username} hugged ${member.username} 🤗`));
	},
	config: {
		name: 'hug',
		description: 'Hug another user in the server.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
	},
};

export default hug;
