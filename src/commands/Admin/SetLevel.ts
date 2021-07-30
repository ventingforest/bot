import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';

class SetLevel extends Command {
	constructor() {
		super('setLevel', {
			aliases: ['set-level', 'set-rank'],
			description: 'Updates the level of a member!',
            args: [
                {
                    id: 'member',
                    type: 'member',
                    index: 0,
                    prompt: {
						start: (msg: Message): string => `${msg.author}, whose level would you like to update?`
					}
                },
                {
                    id: 'level',
                    type: 'number',
                    index: 1,
                    prompt: {
						start: (msg: Message): string => `${msg.author}, what level would you like to make them now?`
					}
                }
            ]
		});

		this.usage = 'set-level <@user> <level>';
		this.examples = ['set-level @newt guillén <3'];
	}

	async exec(msg: Message, { member, level }: { member: GuildMember, level: number }) {
        this.client.utils.deletePrompts(msg); // Clean any prompts
        let userDoc = await this.client.db.user.findUnique({ where: { id: member.id }}); // Get the member's document
        const oldLevelReward = this.client.social.levelReward(userDoc.level); // Find the old level reward
        const levelReward = this.client.social.levelReward(level); // Find the new level reward

        // Update them
        userDoc = await this.client.db.user.update({
            where: { id: userDoc.id },
            data: {
                level,
                xp: this.client.social.xpFor(level)
            }
        });

        // Remove any level role the member may have, and replace it with the new one
        this.client.constants.levelRoles.forEach(r => member.roles.cache.has(r.roleID) ? member.roles.remove(r.roleID) : null);
        member.roles.add(levelReward.roleID);

        // Finished!
        const embed = this.client.utils.embed()
            .setTitle(`${member.user.username} is now level ${userDoc.level!}`)
            .setColor(this.client.constants.colours.green)
            .setThumbnail(member.user.avatarURL())
            .setAuthor(msg.author.username, msg.author.avatarURL())
            .setDescription(`This means that they are now a ${levelReward.name} - ${oldLevelReward ? `they were previously a ${oldLevelReward.name}!` : ''}`);

        msg.channel.send(embed);
        this.client.logger.command(`${this.client.userLogCompiler(msg.author)} made ${this.client.userLogCompiler(member.user)} level ${userDoc.level}!`);
    }
}

module.exports = SetLevel;
export default SetLevel;
