import { nanoid } from 'nanoid';
import _ from 'lodash';

export default {
	name: 'suggest',
	description: 'Makes a suggestion on your behalf!',
	args: true,
	usage: '<suggestion>',
	run: async (tvf, msg, args) => {
		const suggestion = args.join(' ');
		const id = nanoid(5);
		
		// post the suggestion
		const embed = tvf.createEmbed({ timestamp: true })
			.setTitle(_.truncate(`New suggestion by ${msg.author.username}!`, { length: tvf.embedLimit.title }))
			.setThumbnail(msg.author.avatarURL())
			.setDescription(_.truncate(suggestion, { length: tvf.embedLimit.description }))
			.setFooter(`Suggestion ID: ${id}`);

		const message = await tvf.const.communityChannels.suggestions.send(embed);
		await message.react(tvf.const.suggestions.upvote);
		await message.react(tvf.const.suggestions.downvote);

		// save the suggestion to the database
		const userDoc = await tvf.userDoc(msg.author.id);

		if (userDoc.toObject().hasOwnProperty('suggestions') && userDoc.suggestions !== null) {
			userDoc.suggestions.push({ id, suggestion, messageID: message.id });
		} else {
			userDoc.suggestions = [{ id, suggestion, messageID: message.id }];
		}
		
		tvf.saveDoc(userDoc);

		// delete the user's message
		await msg.delete();
	}
} as Command;
