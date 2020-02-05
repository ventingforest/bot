import axios from 'axios';

const wholesome: Command = {
	run: async (tvf, msg, args) => {
		// get a random post
		const post = (await axios.get('https://www.reddit.com/r/wholesome/random.json')).data[0].data.children[0].data;

		// make an embed and post it
		const embed = tvf.createEmbed()
			.setTitle(tvf.truncate(post.title, 256))
			.setURL(`https://reddit.com${post.permalink}`)
			.setImage(post.url)
			.setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL());

		return msg.channel.send(embed);
	},
	config: {
		name: 'wholesome',
		description: 'Gets a random image from r/wholesome!',
		module: 'Fun',
		allowGeneral: false,
	},
};

export default wholesome;