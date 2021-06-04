import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';

class SetLevel extends Command {
	constructor() {
		super('setLevel', {
			aliases: ['set-level', 'set-rank'],
			category: 'Admin',
			description: 'Updates the level of a member!',
            args: [
                {
                    id: 'member',
                    type: 'member',
                    index: 0,
                    prompt: {
						start: (msg: Message): string => `${msg.author}, who would you like to update the level of?`
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
		this.examples = ['set-level @newt <3#1234'];
	}

	async exec(msg: Message, { member, level }: { member: GuildMember, level: number }) {
        this.client.deletePrompts(msg); // Clean any prompts
        const doc = await this.client.userDoc(member.id); // Get the member's document
        doc.level = level; // Update their level
        doc.xp = this.client.xpFor(doc.level); // Update their xp
        const levelReward = this.client.levelReward(doc.level); // Find the level reward
        await this.client.saveDoc(doc); // Save the document

        // Deal with role updates
        this.client.constants.levelRoles.forEach(r => member.roles.cache.has(r.role.id) ? member.roles.remove(r.role.id) : null);
        member.roles.add(levelReward.role);

        // Finished!
        msg.channel.send(`**${member.user.tag}** is now level **${doc.level}** (${levelReward.name})!`);
    }
}

module.exports = SetLevel;
export default SetLevel;