import _ from 'lodash';
import User from '../../models/user';

export default {
	name: 'approve',
	description: 'Approve a suggestion!',
	allowGeneral: true,
	args: true,
    usage: '<id> [comment]',
    staffAccess: ['Admin'],
	run: async (tvf, msg, args) => {
        const id = args[0];
        args.shift();
        const comment = args.join(' ') || 'No comment provided.';

        // search for the user who made the suggestion
        const user = await User.findOne({ 'suggestions.id': id }, (err, res) => err ? () => {
            tvf.logger.error(err);
            msg.channel.send(`**${tvf.const.cross}  |**  Either there was an error looking for the suggestion, or a suggestion with that ID does not exist. Please try again.`);
        } : res);
        const member = tvf.server.member(user.id);
        const suggestion = user.suggestions.find(s => s.id === id);
        
        // update the original suggestion message
        const embed = tvf.createEmbed({ timestamp: true, colour: tvf.const.green })
			.setTitle(`Suggestion by ${_.truncate(member.user.username, { length: tvf.embedLimit.title - 40 })} has been approved!`)
            .setThumbnail(msg.author.avatarURL())
            .setDescription(_.truncate(suggestion.suggestion, { length: tvf.embedLimit.description }))
            .addField(`Approved by ${msg.author.username}`, `**${tvf.const.suggestions.upvote.toString()}  |**  ${_.truncate(comment, { length: tvf.embedLimit.field.value - 20 })}`)
            .setFooter(`Suggestion ID: ${id}`);

        tvf.const.communityChannels.suggestions.messages.fetch(suggestion.messageID)
            .then(async res => {
                await res.edit(embed);
            })
            .catch(err => tvf.logger.error(err));

        // notify the user
        const approved = tvf.createEmbed({ colour: tvf.const.green, timestamp: true })
            .setTitle(`Your suggestion has been approved by ${_.truncate(msg.author.username, { length: tvf.embedLimit.title - 40 })}!`)
            .setThumbnail(msg.author.avatarURL())
            .addField('Suggestion', _.truncate(suggestion.suggestion, { length: tvf.embedLimit.field.value }))
            .setFooter(`Suggestion ID: ${suggestion.id}`);

        member.send(approved);
		await msg.delete();
	}
} as Command;
