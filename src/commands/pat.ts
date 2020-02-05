import axios from 'axios';

const pat: Command = {
	run: async (tvf, msg, args) => {
		// find the mentioned member
		const member = tvf.checkForMember(msg, args).user;

		await msg.delete();

		// make a request for a gif
		const gif = (await axios.get('https://nekos.life/api/pat')).data.url;
		const embed = tvf.createEmbed().setImage(gif).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		// check if the mentioned user was the author of the message
		if (member === msg.author) {
			return msg.channel.send(embed.setTitle(`${msg.author.username}... patted their own head? 🤔`).setImage('https://i.imgur.com/PYD7b5A.gif'));
		}

		if (member === tvf.bot.user) {
			return msg.channel.send(embed.setTitle(`${msg.author.username} patted my head 😇`));
		}

		return msg.channel.send(embed.setTitle(`${msg.author.username} patted ${member.username}'s head 😇`));
	},
	config: {
		name: 'pat',
		description: 'Pat another user\'s head.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
		allowGeneral: false,
	},
};

export default pat;
