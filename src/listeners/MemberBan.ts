import { Listener } from 'discord-akairo';
import { Guild, User } from 'discord.js';
import UserModel from '../models/user';

class MemberBan extends Listener {
	constructor() {
		super('memberBan', {
			emitter: 'client',
			event: 'guildBanAdd',
		});
	}

	exec(_guild: Guild, user: User) {
		if (this.client.isProduction) {
            // Delete the user's document from the database - it is likely they will never return anyway
            UserModel.findOneAndDelete({ id: user.id }).then(() => this.client.logger.db(`${user.tag}'s (${user.id}) document has been removed from the database! Reason: Banned`));

            // Send the ban message
            if (this.client.botBanner && user.bot) {
                const embed = this.client.util.embed()
                    .setColor(this.client.constants.colours.red)
                    .setTitle('Begone Bot!');

                this.client.constants.channels.general.send(embed.setDescription(`${user.tag} was banned from the server - pesky bot!`));
                this.client.constants.channels.staff.moderators.chat.send(embed.setDescription(`${user.tag} was banned from the server, as the bot banner is enabled. If this was a mistake, please unban the bot after running \`${this.client.prefix}botban\` and try readding it to the server!`));
            } else {
                this.client.constants.channels.general.send(`**${user.tag}** has been banned from the Forest.`);
            }
        }
	}
}

module.exports = MemberBan;