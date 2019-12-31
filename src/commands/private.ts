import User from '../models/user';
import * as Discord from 'discord.js';
import * as uniqid from 'uniqid';
import * as moment from 'moment';

const privateVenting: Command = {
	run: async (tvf, msg, args) => {
		const subcommand = args[0];

		if (subcommand === 'cancel') {
			await msg.delete();

			// get the reason from the command
			args.shift();
			const reason = args.join(' ') ? args.join(' ') : '*No reason specified.*';

			// get the author of the message from the database
			const doc = await User.findOne(
				{
					id: msg.author.id,
				},
				(err, res) => {
					if (err) return tvf.logger.error(err);
					else return res;
				},
			);

			// ensure that the author has requested a private venting session
			if (!doc.private.requested) {
				return msg.author.send(
					'Sorry, you don\'t have a private venting session to cancel!',
				);
			}

			// post a message in the forest keeper channel
			const cancelledAt = moment(msg.createdAt).format(tvf.other.MOMENT_FORMAT);

			const embed = tvf
				.createEmbed('red')
				.setTitle(
					`Private venting session cancelled by ${msg.author.tag}`,
				)
				.addField('User', msg.author.tag, true)
				.addField('Session ID', doc.private.id, true)
				.addField('User ID', msg.author.id, true)
				.addField('Reason', reason)
				.setFooter(`Cancelled at ${cancelledAt}`);

			tvf.sendToChannel(tvf.channels.FK, embed);

			doc.private.requested = false;
			doc.private.id = null;
			doc.save().catch((error) => tvf.logger.error(error));
		}
		else if (
			subcommand === 'start' &&
            msg.guild.member(msg.author).roles.has(tvf.roles.FK)
		) {
			const id = args[1];

			// try and find a user with that id in their document
			const doc = await User.findOne(
				{ 'private.requested': true, 'private.id': id },
				(err, res) => {
					if (err) return tvf.logger.error(err);
					else return res;
				},
			);

			if (!doc) {
				return msg.channel.send(
					'That is an invalid ID, or the session has already been started!',
				);
			}
			const member = msg.guild.member(doc.id);

			// get an array of the member's roles
			const roles = member.roles.map((r) => r.id);

			// remove all of the member's roles and give them the private venting role
			await member.roles
				.remove(member.roles.array(), 'Private venting')
				.catch((err) => tvf.logger.error(err));
			await member.roles.add(tvf.roles.PRIVATE, 'Private venting');

			// post a message in the private venting
			const startedAt = moment(msg.createdAt).format(tvf.other.MOMENT_FORMAT);

			const embed = tvf
				.createEmbed('green')
				.setTitle(`Welcome to private venting, ${member.user.tag}`)
				.addField(
					'Your session is being taken by...',
					msg.author.tag,
					true,
				)
				.addField('ID', doc.private.id, true)
				.setFooter(`Started at ${startedAt}`);

			const takenEmbed = tvf
				.createEmbed('green')
				.setTitle(`${member.user.tag}'s private venting session is currently being taken`)
				.addField('Taken by', msg.author.tag, true)
				.addField('Session ID', doc.private.id, true)
				.setFooter(`Started at ${startedAt}`);

			tvf.sendToChannel(tvf.channels.PRIVATE, embed);
			tvf.sendToChannel(tvf.channels.FK, takenEmbed);

			// update the document
			doc.private.requested = false;
			doc.roles = roles;
			doc.save().catch((error) => tvf.logger.error(error));
		}
		else if (
			subcommand === 'end' &&
            msg.guild.member(msg.author).roles.has(tvf.roles.FK)
		) {
			const id = args[1];

			// get end notes from the command
			args.shift();
			args.shift();
			const notes = args.join(' ') ? args.join(' ') : '*No notes provided.*';

			// try and find a user with that id in their document
			const doc = await User.findOne(
				{ 'private.requested': false, 'private.id': id },
				(err, res) => {
					if (err) return tvf.logger.error(err);

					return res;
				},
			);

			if (!doc) return msg.channel.send('That is an invalid ID!');
			const member = msg.guild.member(doc.id);

			// get the roles from the database
			const roles: Discord.Collection<
                string,
                Discord.Role
            > = new Discord.Collection();

			for (let i = 0; i < doc.roles.length; i++) {
				const rId = doc.roles[i];
				const role = msg.guild.roles.get(rId);
				roles.set(rId, role);
			}

			// add them back
			await member.roles
				.add(roles, 'End private venting')
				.catch((err) => tvf.logger.error(err));
			await member.roles.remove(tvf.roles.PRIVATE, 'End private venting');

			// post a message in the private venting
			const endedAt = moment(msg.createdAt).format(tvf.other.MOMENT_FORMAT);

			const embed = tvf
				.createEmbed('red')
				.setTitle('Session over.')
				.addField('Session ID', doc.private.id, true)
				.addField('Recipient', member.user.tag, true)
				.addField('Taken by', msg.author.tag, true)
				.addField('Notes', notes)
				.setFooter(`Ended at ${endedAt}`);

			const finishedEmbed = tvf
				.createEmbed('red')
				.setTitle(`${msg.author.tag} has finished taking ${member.user.tag}'s session`)
				.addField('Session ID', doc.private.id, true)
				.addField('Notes', notes)
				.setFooter(`Ended at ${endedAt}`);

			tvf.sendToChannel(tvf.channels.PRIVATE, embed);
			tvf.sendToChannel(tvf.channels.FK, finishedEmbed);

			// update the document
			doc.private.id = null;
			doc.roles = [];
			doc.save().catch((error) => tvf.logger.error(error));
		}
		else {
			await msg.delete();
			msg.author.send(`
Your private venting request has been queued! Your session may begin quickly, or it may take a while, depending on how busy we are and how many staff are available - please stay online until your session begins, and you will receive a ping from The Venting Forest server when we're ready for you. **Do not send another request or spam the command; doing this may result in a ban from using private venting.**
*If you think you've made a mistake and want to cancel your session, please DM an online Admin or Moderator ASAP.*

__A few things to note before you start...__

• Private sessions typically last only fifteen minutes, as such, the staff are not obliged to continue after this point. However, you can request more time.
• Our staff are *not* counsellors or medical professionals. They cannot offer you medical or deep life advice. 
• Your sessions can be viewed by all staff members, but no-one else, and staff are not allowed to share the contents elsewhere, **unless** you disclose that you or another are at serious risk, or you disclose something illegal.
• Staff reserve the right to transfer your session over to another for any given reason during your session.
			`);

			// get the reason from the command
			const reason = args.join(' ') ? args.join(' ') : '*No reason specified.*';

			// get the author of the message from the database
			const doc = await User.findOne(
				{
					id: msg.author.id,
				},
				(err, res) => {
					if (err) return tvf.logger.error(err);

					return res;
				},
			);

			// if they have already requested a private venting session, don't allow them to request another
			if (doc.private.requested) {
				return msg.author.send(
					'You have already requested a private venting session! Please be patient (:',
				);
			}

			// create an ID for the session, and update the database
			const id = uniqid();
			doc.private.requested = true;
			doc.private.id = id;
			doc.save().catch((error) => tvf.logger.error(error));

			// post a message in the forest keeper channel
			const requestedAt = moment(msg.createdAt).format(tvf.other.MOMENT_FORMAT);

			const embed = tvf
				.createEmbed('green')
				.setTitle(
					`Private venting session requested by ${msg.author.tag}`,
				)
				.setDescription(
					`Start the session now by typing \`tvf private start ${id}\` in the private venting channel.`,
				)
				.addField('User', msg.author.tag, true)
				.addField('Session ID', id, true)
				.addField('User ID', msg.author.id, true)
				.addField('Reason', reason)
				.setFooter(`Requested at ${requestedAt}`);

			tvf.sendToChannel(tvf.channels.FK, tvf.isProduction ? `<@&${tvf.roles.FK}>` : '', embed);
		}
	},
	config: {
		name: 'private',
		module: 'Core',
		description: 'Requests/cancels a private venting session!',
		usage: '<request|cancel> [reason]',
		allowGeneral: true,
	},
};

export default privateVenting;
