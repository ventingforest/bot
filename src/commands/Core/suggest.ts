import shortid from 'shortid';
import _ from 'lodash';

export default {
	name: 'suggest',
	description: 'Makes a suggestion on your behalf!',
	args: true,
	usage: '<suggestion>',
	run: async (tvf, msg, args) => {
		const suggestion = args.join(' ');
		const id = shortid.generate();
		
		// post the suggestion
		const embed = tvf.createEmbed({ timestamp: true })
			.setTitle(_.truncate(`New suggestion by ${msg.author.username}!`, { length: tvf.embedLimit.title }))
			.setThumbnail(msg.author.avatarURL())
			.setDescription(_.truncate(suggestion, { length: tvf.embedLimit.description }))
			.setFooter(`Suggestion ID: ${id}`);

		const message = await tvf.channels.community.suggestions.send(embed);
		await message.react(tvf.emojis.suggestions.upvote);
		await message.react(tvf.emojis.suggestions.downvote);

		// save the suggestion to the database
		const userDoc = await tvf.userDoc(msg.author.id);
		userDoc.suggestions.push({ id, suggestion, messageID: message.id });
		tvf.saveDoc(userDoc);

		// delete the user's message
		await msg.delete();
	}
} as Command;
