import * as moment from 'moment';

const github: Command = {
	run: async (tvf, msg) => {
		const { data } = await tvf.octokit.repos.get({
			owner: 'ventingforest',
			repo: 'bot',
		});

		const embed = tvf.createEmbed()
			.setAuthor('TVF Bot', data.owner.avatar_url, tvf.other.GITHUB)
			.setDescription(`[Check it out.](${tvf.other.GITHUB})`)
			.setThumbnail(data.owner.avatar_url)
			.addField('Last Pushed', moment(data.pushed_at).format(tvf.other.MOMENT_FORMAT))
			.addField('Stars', data.stargazers_count, true)
			.addField('Open Issues', data.open_issues_count, true);

		return msg.channel.send(embed);
	},
	config: {
		name: 'github',
		module: 'Core',
		description: 'Check out my GitHub repository!',
	},
};

export default github;
