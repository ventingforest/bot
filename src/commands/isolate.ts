import User from '../models/user';
import * as Discord from 'discord.js';

const isolate: Command = {
	run: async (tvf, msg, args) => {
		await msg.delete();
		args.shift();

		// get the tagged member
		const member =
            msg.mentions.members.first() === undefined
            	? msg.guild.members.find(({ user }) => user.tag === args[0])
            	: msg.mentions.members.first();

		if (!member) {
			return msg.author.send(
				'you had to mention a user in order to isolate them.',
			);
		}

		// prepare the reason
		let reason = args.join(' ');
		if (!reason) reason = 'No reason specified.';

		// get the member's document from the database
		const doc = await User.findOne({ id: member.user.id }, (err, res) => {
			if (err) return tvf.logger.error(err);

			return res;
		});

		if (!doc.isolated) {
			// get an array of the member's roles
			const roles = member.roles.map((r) => r.id);

			// remove the roles from the member and add the isolated role
			await member.roles
				.remove(member.roles.array(), 'Isolated')
				.catch((err) => tvf.logger.error(err));
			await member.roles.add(tvf.roles.ISOLATION, 'Isolated');

			// update and save the document
			doc.roles = roles;
			doc.isolated = true;

			doc.save().catch((error) => tvf.logger.error(error));

			// alert the staff
			const embed = tvf
				.createEmbed('red')
				.setTitle('Isolated')
				.addField('Target', member.user, true)
				.addField('Isolated by', msg.author, true)
				.addField('Reason', reason);

			tvf.sendToChannel(tvf.channels.FK, embed);
			tvf.sendToChannel(tvf.channels.MODLOG, embed);
			tvf.sendToChannel(tvf.channels.ISOLATION, `Hey there, <@!${member.user.id}>. You have been isolated. Don't worry - this doesn't necessarily mean that you have done anything wrong. We have put you here in order to help you calm down if you're feeling bad, or if you are bringing harm to other members of the server. Within this channel there is only you and the staff - feel free to talk to them.`);
		}
		else if (doc.isolated) {
			// get the roles from the database
			const roles: Discord.Collection<
                string,
                Discord.Role
            > = new Discord.Collection();

			for (let i = 0; i < doc.roles.length; i++) {
				const id = doc.roles[i];
				const role = msg.guild.roles.get(id);
				roles.set(id, role);
			}

			await member.roles
				.add(roles, 'Un-isolated')
				.catch((err) => tvf.logger.error(err));
			await member.roles.remove(tvf.roles.ISOLATION, 'Un-isolated');

			// update and save the document
			doc.roles = [];
			doc.isolated = false;

			// alert the staff
			const embed = tvf
				.createEmbed('green')
				.setTitle('Un-isolated')
				.setDescription(
					`<@!${member.user.id}> has been un-isolated by <@!${msg.author.id}>`,
				);

			tvf.sendToChannel(tvf.channels.FK, embed);
			tvf.sendToChannel(tvf.channels.MODLOG, embed);
			tvf.sendToChannel(tvf.channels.ISOLATION, `<@!${member.user.id}> has been un-isolated.`);

			return doc.save().catch((error) => tvf.logger.error(error));
		}
	},
	config: {
		name: 'isolate',
		module: 'Mod',
		description: 'Isolates a user!',
		args: true,
		usage: '<@user> *reason*',
		allowGeneral: true,
	},
};

export default isolate;
