import User from '../models/user';
import * as Discord from 'discord.js';
import * as shortid from 'shortid';
import * as moment from 'moment';

const privateVenting: Command = {
	run: async (tvf, msg, args) => {
		const subcommand = args[0];

		if (subcommand === 'cancel') {
			await msg.delete();

			// get the reason and any mentioned ID from the command
			const id = args[1];
			args.shift();
			let reason = args.join(' ') ? args.join(' ') : '*No reason specified.*';

			// calculate the cancelled at time
			const cancelledAt = moment(msg.createdAt).format(tvf.other.MOMENT_FORMAT);

			// check if a staff member run this command, and it has an ID after it
			if (id && tvf.isFK(msg.author)) {
				// get the venter's document frsom the database
				const doc = await User.findOne({ 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);

				// update the reason
				args.shift();
				reason = args.join(' ') ? args.join(' ') : '*No reason specified.*';

				// post an announcement in the forest keeper channel
				const embed = tvf
					.createEmbed('red')
					.setTitle(`${msg.author.tag} has cancelled ${doc.tag}'s session`)
					.addField('Session ID', doc.private.id, true)
					.addField('venter ID', doc.id, true)
					.addField('Canceller ID', msg.author.id, true)
					.addField('Reason', reason)
					.setFooter(`Cancelled at ${cancelledAt}`);

				tvf.sendToChannel(tvf.channels.FK, embed);

				// inform the venter that their session has been cancelled
				const venter = msg.guild.member(doc.id);
				const venterEmbed = tvf
					.createEmbed('red')
					.setTitle('A member of staff has cancelled your private venting session!')
					.setThumbnail(msg.guild.iconURL())
					.setDescription('If you believe this has been done in error, don\'t hesitate to contact a member of staff.')
					.addField('Reason', reason)
					.setFooter(`Cancelled at ${cancelledAt}`);

				venter.send(venterEmbed);

				// update the document
				doc.private.requested = false;
				doc.private.id = null;
				doc.private.reason = null;
				return doc.save().catch(err => tvf.logger.error(err));
			}

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
			const embed = tvf
				.createEmbed('red')
				.setTitle(
					`${msg.author.tag} has cancelled their private venting session.`,
				)
				.addField('Session ID', doc.private.id, true)
				.addField('User ID', msg.author.id, true)
				.addField('Reason', reason)
				.setFooter(`Cancelled at ${cancelledAt}`);

			tvf.sendToChannel(tvf.channels.FK, embed);

			doc.private.requested = false;
			doc.private.id = null;
			doc.private.reason = null;
			doc.save().catch((error) => tvf.logger.error(error));
		}
		else if (subcommand === 'list' && tvf.isFK(msg.author)) {
			// collect the documents of all users that have a pending session
			const docs = await User.find({ 'private.requested': true }, (err, res) => err ? tvf.logger.error(err) : res);

			// prepare an embed
			const embed = docs.length === 0 ? tvf
				.createEmbed('green')
				.setTitle('No private venting sessions pending!')
				 : tvf
					.createEmbed('orange')
					.setTitle('Pending private venting sessions...');

			embed.setFooter(`${docs.length} sessions pending.`);

			// loop through all of the documents and add fields
			docs.map((doc, i) => {
				++i;

				// seperate embeds every 25 fields
				if (i % 25 === 0) {
					msg.channel.send(embed);
					embed.fields = [];
				}

				// add details to the embed
				embed.addField(`${i}. ${doc.tag}`, `Reason: ${doc.private.reason}\nSession ID: ${doc.private.id}`);
			});

			// send the embed
			return msg.channel.send(embed);
		}
		else if (subcommand === 'start' && tvf.isFK(msg.author)) {
			await msg.delete();
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
				return msg.reply(
					`\`${id}\` is an invalid ID, or the session associated with the ID has already been started!`,
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
				.setTitle(`Welcome to private venting, ${member.user.username}!`)
				.addField(
					'Your session is being taken by...',
					msg.author.tag,
					true,
				)
				.setFooter(`Session ID: ${doc.private.id} | Started at ${startedAt}`);

			const takenEmbed = tvf
				.createEmbed('green')
				.setTitle(`${member.user.tag}'s private venting session is currently being taken by ${msg.author.tag}`)
				.setFooter(`Session ID: ${doc.private.id} | Started at ${startedAt}`);

			tvf.sendToChannel(tvf.channels.PRIVATE, `<@!${doc.id}>`, embed);
			tvf.sendToChannel(tvf.channels.FK, takenEmbed);

			// update the document
			doc.private.requested = false;
			doc.roles = roles;
			doc.save().catch((error) => tvf.logger.error(error));
		}
		else if ((subcommand === 'end' || subcommand === 'stop') && tvf.isFK(msg.author)) {
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

			if (!doc) return msg.reply(`\`${id}\` is an invalid ID!`);
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
				.addField('Venter', member.user.tag, true)
				.addField('Taken by', msg.author.tag, true)
				.addField('Notes', notes)
				.setFooter(`Session ID: ${doc.private.id} | Ended at ${endedAt}`);

			const finishedEmbed = tvf
				.createEmbed('red')
				.setTitle(`${msg.author.tag} has finished taking ${member.user.tag}'s session`)
				.addField('Notes', notes)
				.setFooter(`Session ID: ${doc.private.id} | Ended at ${endedAt}`);

			tvf.sendToChannel(tvf.channels.PRIVATE, embed);
			tvf.sendToChannel(tvf.channels.FK, finishedEmbed);

			// update the document
			doc.private.id = null;
			doc.roles = [];
			doc.save().catch((error) => tvf.logger.error(error));
		}
		else {
			await msg.delete();

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
			const id = shortid.generate();
			doc.private.requested = true;
			doc.private.id = id;
			doc.private.reason = reason;
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

			// send a message to the venter
			const venterEmbed = tvf
				.createEmbed('green')
				.setTitle('Your private venting session has been requested.')
				.setDescription('Your session may begin quickly, or it may take some time - it depends on how busy we are, how many staff are available, and whether any staff are comfortable with taking it. Please remain online until your session begins. You\'ll recieve a ping from the server when we\'re ready for you. A few things to note before we start...')
				.setThumbnail(msg.guild.iconURL())
				.addField('The 15 minute rule', 'Private venting sessions typically only last fifteen minutes. As such, staff are not obliged to continue after this point. However, you can request more time.')
				.addField('Our staff are not counsellors or medical professionals', 'They can not offer you medical or deep life advice.')
				.addField('Who can view your session', 'Your sessions can be viewed by all staff members, but no-one else and staff are not allowed to share the contents elsewhere, **unless** you disclose that you or another are at serious risk, or you disclose something illegal.')
				.addField('The right to transfer', 'Staff reserve the right to transfer your session over to another for any given reason during your session.');

			return msg.author.send(venterEmbed);
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