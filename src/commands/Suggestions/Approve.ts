import { colours, SuggestionStates } from '~config';
import Command from '~handler/Command';
import Embed from '~structures/Embed';

@Command.Config({
    name: 'approve',
    description: 'Approve a suggestion!',
    preconditions: ['ForestKeeperOnly'],
    args: [
        {
            name: 'suggestionId',
            required: true
        },
        {
            name: 'comment',
            required: false
        }
    ]
})
export default class SuggestionApproved extends Command {
    public async messageRun(message: Command.Message, args: Command.Args) {
        const suggestionId = parseInt(args.next());
        const suggestion = await this.client.db.suggestion.findUnique({ where: { suggestionId } });
        let responseEmbed: Embed;

        if (suggestion) {
            // Find the suggestion message and update the embed
            const suggestionMessage = await this.client.tvf.channels.suggestions.messages.fetch(
                suggestion.messageId
            );
            const suggestionAuthor = await this.client.users.fetch(suggestion.authorId);
            const { value: comment } = await args.restResult('string');

            const newEmbed = suggestionMessage.embeds[0]
                .setTitle(`Suggestion by ${suggestionAuthor.username} has been approved!`)
                .setDescription(suggestion.content)
                .addField('Comment from the staff!', comment)
                .setColor(colours.success);

            await suggestionMessage.edit({
                embeds: [newEmbed]
            });

            // Inform the user that their suggestion has updated
            try {
                await suggestionAuthor.send({
                    embeds: [newEmbed.setTitle('Your suggestion has been approved!')]
                });
            } catch (err) {}

            // Update the suggestion in the database
            await this.client.db.suggestion.update({
                where: { suggestionId },
                data: {
                    comment,
                    state: SuggestionStates.Approved
                }
            });

            responseEmbed = new Embed('success', message.member)
                .setThumbnail(suggestionAuthor.avatarURL())
                .setDescription(
                    `Suggestion #${suggestionId} has been approved! Check it out in ${this.client.tvf.channels.suggestions.toString()}!`
                );
        } else {
            responseEmbed = new Embed('error').setDescription(
                'A suggestion with that ID does not appear to exist! Please check that you have inputted it right (:'
            );
        }

        await message.reply({ embeds: [responseEmbed] });
    }
}