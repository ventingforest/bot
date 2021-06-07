import { Command } from 'discord-akairo';
import { Message, EmbedFieldData } from 'discord.js';
import User from '../models/user';
import { stripIndents } from 'common-tags';

class Leaderboard extends Command {
	constructor() {
		super('leaderboard', {
			aliases: ['leaderboard', 'lb'],
			category: 'Core',
			description: 'Shows a leaderboard of level rankings! You may specify a page number if you wish, if not page 1 will be returned.',
            args: [
                {
                    id: 'page',
                    type: 'number',
                    default: 1
                }
            ]
		});

		this.usage = 'leaderboard [page]';
		this.examples = [
            'leaderboard',
            'leaderboard 1'
        ];
	}

	async exec(msg: Message, { page }: { page: number }) {
        // Get all user documents, sorted by descending lifetime xp
        User.find().sort({ xp: -1 }).exec(async (err, docs) => {
            if (err) this.client.logger.error(err);

            // Calculate some stats
            const filteredDocs = docs.filter(user => this.client.server.member(user.id) !== null);
            const authorDoc = filteredDocs.find(doc => doc.id === msg.author.id);
            const authorRank = docs.indexOf(authorDoc) + 1;
            const pages = Math.ceil(filteredDocs.length / 10);

            // Ensure that the provided page is in range
            if (page > pages || page <= 0) {
                const error = this.client.util.embed()
                    .setTitle(`Page ${page} is out of range!`)
                    .setDescription(`There is a grand total of ${pages} pages that can be viewed. Please try again with a valid page number.`)
                    .setColor(this.client.constants.colours.red)
                    .setThumbnail(this.client.server.iconURL());
                return msg.channel.send(error);
            }

            // Create the embed
            const embed = this.client.util.embed()
                .setAuthor(`${this.client.server.name} Leaderboard`, this.client.server.iconURL())
                .setColor(this.client.constants.colours.green)
                .setThumbnail(this.client.server.iconURL())
                .setDescription(`Displaying data for ranks ${(page * 10) - 9} to ${page * 10}...`)
                .setFooter(`Page ${page}/${pages} • Your leaderboard rank: ${authorRank}`, msg.author.avatarURL());

            // Generate field data
            const fields: EmbedFieldData[] = await Promise.all(filteredDocs.slice((page * 10) - 10, page * 10).map(async (user) => {
                const rank = filteredDocs.indexOf(user) + 1;
                const profile = await this.client.users.fetch(user.id);
                const levelReward = this.client.levelReward(user.level);
                const xp = this.client.formatNumber(user.xp - this.client.xpFor(user.level));
                const lifetimeXp = this.client.formatNumber(user.xp);

                return {
                    name: `#${rank} - ${profile.tag}`,
                    value: stripIndents`
                        • Level **${user.level}** ${levelReward ? `(${levelReward.name})` : ''}
                        • **${xp}** xp
                        • **${lifetimeXp}** lifetime xp
                    `
                }
            }));

            // Send the embed
            embed.addFields([this.client.constants.blankField, ...fields]);
            msg.channel.send(embed);

            this.client.logger.command(`${this.client.userLogCompiler(msg.author)} requested page ${page}/${pages} of the server level leaderboard.`);
        });
	}
}

module.exports = Leaderboard;
export default Leaderboard;