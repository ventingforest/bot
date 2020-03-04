import User from '../models/user';
import * as Discord from 'discord.js';
import * as moment from 'moment';

const isolate: Command = {
	run: async (tvf, msg, args) => {
		await msg.delete();
		args.shift();

		// get the tagged member
		const member =
            msg.mentions.members.first() === undefined
            	? (await msg.guild.members.fetch()).find(({ user }) => user.tag === args[0])
            	: msg.mentions.members.first();

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
			const roles = member.roles.cache.map((r) => r.id);

			// remove the roles from the member and add the isolated role
			await member.roles
				.remove(member.roles.cache.array(), 'Isolated')
				.catch((err) => tvf.logger.error(err));
			await member.roles.add(tvf.roles.ISOLATION, 'Isolated');

			// update and save the document
			doc.roles = roles;
			doc.isolated = true;

			doc.save().catch((error) => tvf.logger.error(error));

			// alert the staff
			const isolatedAt = moment(msg.createdAt).format(tvf.other.MOMENT_FORMAT);

			const embed = tvf
				.createEmbed('red')
				.setTitle('Isolated')
				.setThumbnail(tvf.server.iconURL())
				.addFields([
					{
						name: 'Target',
						value: member.user,
					},
					{
						name: 'Reason',
						value: reason,
					},
				])
				.setFooter(`Isolated by ${msg.author.tag} at ${isolatedAt}`, msg.author.avatarURL());

			tvf.sendToChannel(tvf.channels.FK, embed);
			tvf.sendToChannel(tvf.channels.MODLOG, embed);

			// welcome the user to isolation
			const welcomeEmbed = tvf
				.createEmbed('green')
				.setTitle(`Welcome to isolation, ${member.user.username}!`)
				.setDescription(`Hey there, ${member.user.username}! Welcome to isolation! You have been put here by a member of staff - but don't worry, this doesn't necessarily mean you have done something wrong. Staff put people here in order to help people calm down if you're feeling bad, or if you are harming other members of the server. Only you and the staff can see this channel, and it is completely private - feel free to talk to them.`)
				.setThumbnail(tvf.server.iconURL());

			tvf.sendToChannel(tvf.channels.ISOLATION, welcomeEmbed);
		}
		else if (doc.isolated) {
			// get the roles from the database
			const roles: Discord.Collection<
                string,
                Discord.Role
            > = new Discord.Collection();

			for (let i = 0; i < doc.roles.length; i++) {
				const id = doc.roles[i];
				const role = await msg.guild.roles.fetch(id);
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
			const unisolatedAt = moment(msg.createdAt).format(tvf.other.MOMENT_FORMAT);

			const embed = tvf
				.createEmbed('green')
				.setTitle('Un-isolated')
				.setThumbnail(tvf.server.iconURL())
				.addFields([
					{
						name: 'Target',
						value: member.user,
					},
					{
						name: 'Notes',
						value: reason,
					},
				])
				.setFooter(`Un-isolated by ${msg.author.tag} at ${unisolatedAt}`, msg.author.avatarURL());

			tvf.sendToChannel(tvf.channels.FK, embed);
			tvf.sendToChannel(tvf.channels.MODLOG, embed);
			tvf.sendToChannel(tvf.channels.ISOLATION, embed);

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
