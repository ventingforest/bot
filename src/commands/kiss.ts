import axios from 'axios';

const kiss: Command = {
	run: async (tvf, msg, args) => {
		// find the mentioned member
		const member = tvf.checkForMember(msg, args).user;

		await msg.delete();

		// make a request for a gif
		const gif = (await axios.get('https://nekos.life/api/kiss')).data.url;
		const embed = tvf.createEmbed().setImage(gif).setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		// check if the mentioned user was the author of the message
		if (member === msg.author) {
			return msg.channel.send(embed.setTitle(`${msg.author.username}... kissed themselves? 🤔`).setImage('https://media1.tenor.com/images/5e5507a6ec490f07864b86aff7e32852/tenor.gif'));
		}

		if (member === tvf.bot.user) {
			return msg.channel.send(embed.setTitle(`${msg.author.username} kissed me 😳💞`));
		}

		return msg.channel.send(embed.setTitle(`${msg.author.username} kissed ${member.username} 💞`));
	},
	config: {
		name: 'kiss',
		description: 'Kiss another user in the server.',
		module: 'Fun',
		args: true,
		usage: '<@user>',
		allowGeneral: false,
	},
};

export default kiss;
