import _ from 'lodash';
import User from '../../models/user';

export default {
	name: 'approve',
	description: 'Approve a suggestion!',
	allowGeneral: true,
	args: true,
	usage: '<id> [comment]',
	run: async (tvf, msg, args) => {
        const id = args[0];
        args.shift();
        const comment = args.join() || 'No comment provided.';

        // search for the user who made the suggestion
        const user = await User.findOne({ 'suggestions.id': id }, (err, res) => err ? () => {
            tvf.logger.error(err);
            msg.channel.send(`**${tvf.emojis.cross}  |**  Either there was an error looking for the suggestion, or a suggestion with that ID does not exist. Please try again.`);
        } : res);

        const suggestion = user.suggestions.find(e => e.id === id);
        
        // update the original suggestion message
        const embed = tvf.createEmbed({ author: true, timestamp: true, colour: tvf.colours.green })
			.setTitle(`Suggestion by ${_.truncate(msg.author.username, { length: tvf.embedLimit.title - 40 })} has been approved!`)
            .setThumbnail(msg.author.avatarURL())
            .setDescription(_.truncate(suggestion.suggestion, { length: tvf.embedLimit.description }))
            .addField(`Approved by ${msg.author.username}`, `**${tvf.emojis.suggestions.upvote.toString()}  |**  ${_.truncate(comment, { length: tvf.embedLimit.field.value - 20 })}`)
            .setFooter(`Suggestion ID: ${id}`);

        tvf.channels.suggestions.messages.fetch(suggestion.messageID)
            .then(async res => {
                await res.edit(embed);
            })
            .catch(err => tvf.logger.error(err));

		// remove the suggestion from the database
        const index = user.suggestions.indexOf(suggestion);
        if (index > -1) user.suggestions.splice(index, 1);
        tvf.saveDoc(user);

        // notify the user
        msg.guild.members.cache.get(user.id).send(`**${tvf.emojis.suggestions.upvote.toString()}  |** your suggestion, \`${suggestion.suggestion}\` (id: ${suggestion.id}) has been approved!`);
		await msg.delete();
	}
} as Command;
