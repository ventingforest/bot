import User, { IUser } from '../../models/user';
import { stripIndents } from 'common-tags';
import moment from 'moment';
import Discord from 'discord.js';
import shortid from 'shortid';
import timeout from 'timeout';

export default {
  name: 'private',
  description: 'Allows you to request/cancel a private venting session!',
  usage: '[reason]',
  allowGeneral: true,
  aliases: ['privatevent', 'privateventing', 'pv'],
  run: async (tvf, msg, args, { prefix }) => {
    const subcommand = args[0];

    // if the user/staff wishes to cancel a session
    if (subcommand === 'cancel') {
      await msg.delete();

      // get the reason and ID
      const id = args[1];
      args.shift();

      let reason = args.join(' ');
      if (!reason) reason = 'No reason specified.';

      let doc: IUser;

      // check if the command was run by staff, and an ID is given
      if (id && tvf.isUser('fk', msg.author)) {
        // get the venter's document from the database by the session's ID
        doc = await User.findOne({ 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);

        // get the venter by their ID
        const venter = msg.guild.members.cache.get(doc.id);

        // update the reason
        args.shift();
        reason = args.join(' ');
        if (!reason) reason = 'No reason specified.';

        // post an announcement in the forest keeper channel
        const staffEmbed = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
          .setThumbnail(venter.user.avatarURL())
          .setTitle(`${msg.author.tag} has cancelled ${venter.user.tag}'s session`)
          .setDescription(reason)
          .addField('Venter ID', venter.id, true)
          .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

          if (venter.nickname) {
            staffEmbed.addField('Venter\'s Nickname', venter.nickname, true);
          }

          staffEmbed.addField('Canceller ID', msg.author.id, true);

          tvf.channels.fk.send(staffEmbed);

          // inform the venter that their session has been cancelled
          const venterEmbed = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false })
            .setTitle('A member of staff has cancelled your private venting session.')
            .setThumbnail(venter.user.avatarURL())
            .setDescription('If you believe this has been done in error, don\'t hesitate to contact a member of staff - or request a new session!')
            .addField('Reason', reason);

          venter.send(venterEmbed).catch(error => {
            tvf.logger.error(error)
            tvf.channels.discussion.send(stripIndents`
              <@!${venter.id}>, your private venting session has been cancelled!
              Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please consider investigating this.
              If you believe this has been done in error, don't hesitate to contact a member of staff - or request a new session!
            `);
          });
      }

      // if the command was run by the user themselves
      else {
        // get the author of the message's document from the database
        doc = await tvf.userDoc(msg.author.id);

        // ensure that the author has requested a private venting session before trying to cancel
        if (!doc.private.requested) {
          return msg.author.send(`**${tvf.emojis.cross}  |**  Sorry, you do not have a pending private venting session to cancel!`)
        }

        // alert staff
        const embed = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
          .setThumbnail(msg.author.avatarURL())
          .setTitle(`${msg.author.username} has cancelled their private venting session`)
          .setDescription(reason)
          .addField('User ID', msg.author.id, true)
          .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

        if (msg.guild.member(msg.author).nickname) {
          embed.addField('Venter Nickname', msg.guild.member(msg.author).nickname, true);
        }

        tvf.channels.fk.send(embed);
      }

      // clear the expiry timeout
      timeout.timeout(doc.private.id, null);
			timeout.timeout(`${doc.private.id}1`, null);
			timeout.timeout(`${doc.private.id}2`, null);
			timeout.timeout(`${doc.private.id}3`, null);
			timeout.timeout(`${doc.private.id}4`, null);
			timeout.timeout(`${doc.private.id}5`, null);

      // update the venter's document
      doc.private.requested = false;
      doc.private.id = null;
      doc.private.reason = null;
      doc.private.requestedAt = null;
      doc.private.startedAt = null;
      doc.private.takenBy = null;

      tvf.saveDoc(doc);
    }

    // if a member of staff requests a list of all pending sessions
    else if (subcommand === 'list' && tvf.isUser('fk', msg.author)) {
      // collect the documents of all users that have a pending session
      const docs = await User.find({ 'private.requested': true }, (err, docs) => err ? tvf.logger.error(err) : docs);

      // prepare an embed
      const embed = tvf.createEmbed();

      if (docs.length === 0) {
        embed
          .setColor(tvf.colours.green)
          .setTitle('No private venting sessions pending!');
      } else {
        embed
          .setColor(tvf.colours.red)
          .setTitle('Pending private venting sessions...')
          .setFooter(`${docs.length} sessions pending...`);


        // loop through all of the documents and add fields
        docs.map((doc, i) => {
          // seperate embeds every 25 fields
          if (i + 1 % 25 === 0) {
            msg.channel.send(embed);
            embed.fields = [];
          }

          const expires = moment(doc.private.requestedAt).add(tvf.privateTimeout, 'ms');
          const fromNow = expires.diff(new Date(), 'h');

          // add field to the embed
          embed.addField(`${i+1}. ${msg.guild.member(doc.id).user.tag}`, `▪ ID: ${doc.private.id}\n▪ Requested at: ${moment(doc.private.requestedAt).format(tvf.moment)}\n▪ Expires at: ${expires.format(tvf.moment)} (${fromNow} hours from now)\n▪ Reason: ${doc.private.reason}`);
        });
      }

      // send the embed
      return msg.channel.send(embed);
    }

    // if a member of staff wants to start a session
    else if (subcommand === 'start' && tvf.isUser('fk', msg.author)) {
      const id = args[1];

      // try and find the venter's document
      const doc = await User.findOne({ 'private.requested': true, 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);
      if (!doc) return msg.channel.send(`**${tvf.emojis.cross}  |**  \`${id}\` is an invalid ID, or the session associated with the ID has been cancelled.`);

      const venter = msg.guild.member(doc.id);

      // get an array of the venter's roles
      const roles = venter.roles.cache.map(r => r.id);

      // remove all of the venter's roles and give them the private venting role
      await venter.roles.remove(venter.roles.cache.array(), `Private Venting - session ${doc.private.id}`).catch(err => tvf.logger.error(err));
      await venter.roles.add(tvf.roles.private, `Private venting - session ${doc.private.id}`);

      // post a message in private venting
      const embed = tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(venter.user.avatarURL())
        .setTitle(`Welcome to private venting, ${venter.user.username}!`)
        .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

      tvf.channels.private.send(`<@!${venter.id}>`, embed);

      // alert staff that the session is being taken
      const takenEmbed = tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(venter.user.avatarURL())
        .setTitle(`${venter.user.tag}'s private venting session is being taken by ${msg.author.username}!`)
        .setFooter(`Session ID: ${doc.private.id}`);

      tvf.channels.fk.send(takenEmbed);

      // update the venter's document
      doc.private.requested = false;
      doc.private.startedAt = new Date();
      doc.private.takenBy = msg.author.tag;
      doc.roles = roles;

      tvf.saveDoc(doc);

      // clear the expiry timeout
      timeout.timeout(doc.private.id, null);
			timeout.timeout(`${doc.private.id}1`, null);
			timeout.timeout(`${doc.private.id}2`, null);
			timeout.timeout(`${doc.private.id}3`, null);
			timeout.timeout(`${doc.private.id}4`, null);
			timeout.timeout(`${doc.private.id}5`, null);
    }

    // if a member of staff wants to end the session
    else if ((subcommand === 'end' || subcommand === 'stop') && tvf.isUser('fk', msg.author)) {
      const id = args[1];

      // get notes from the command
      args.shift();
      args.shift();

      let notes = args.join(' ');
      if (!notes) notes = 'No notes provided.';

      // try and find the venter's document
      const doc = await User.findOne({ 'private.requested': false, 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);
      if (!doc) return msg.channel.send(`**${tvf.emojis.cross}  |**  \`${id}\` is an invalid ID!`);

      const venter = msg.guild.member(doc.id);

      // get the venter's roles from the database
      const roles: Discord.Collection<string, Discord.Role> = new Discord.Collection();

      for (let i = 0; i < doc.roles.length; i++) {
        roles.set(doc.roles[i], msg.guild.roles.cache.get(doc.roles[i]));
      }

      // add the roles back to the venter, and remove the private venting role
      await venter.roles.add(roles, `Private Venting ended - session ${doc.private.id}`).catch(err => tvf.logger.error(err));
      await venter.roles.remove(tvf.roles.private, `Private Venting ended - session ${doc.private.id}`);

      // post a message in the private ventigng channel
      const embed = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(venter.user.avatarURL())
        .setTitle(`${venter.user.username}'s session is over.`)
        .setDescription(notes)
        .addFields([
          {
            name: 'Taken by',
            value: doc.private.takenBy,
            inline: true,
          },
          {
            name: 'Time open',
            value: `${moment(new Date()).diff(moment(doc.private.startedAt), 'minutes')} minutes`,
            inline: true,
          },
          {
            name: 'Started at',
            value: moment(doc.private.startedAt).format(tvf.moment),
          },
          {
            name: 'Ended at',
            value: moment(new Date()).format(tvf.moment),
          },
        ])
        .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

      tvf.channels.private.send(embed);

      // alert staff that the session has finished
      const finishedEmbed = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(venter.user.avatarURL())
        .setTitle(`${venter.user.tag}'s session is over.`)
        .setDescription(notes)
        .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

      tvf.channels.fk.send(finishedEmbed);

      // update the document
      doc.private.id = null;
      doc.private.reason = null;
      doc.private.requested = null;
      doc.private.requestedAt = null;
      doc.private.startedAt = null;
      doc.private.takenBy = null;
      doc.roles = [];

      return tvf.saveDoc(doc);
    }

    // if the author wants to request a session
    else {
      await msg.delete();

      // get the reason
      const reason = args.join(' ');
      if (!reason) {
        return msg.author.send(`**${tvf.emojis.cross}  |**  When requesting a session you must provide a reason!`);
      }

      // get the author's document
      const doc = await tvf.userDoc(msg.author.id);

      // if they have already requested a session, stop them from requesting another
      if (doc.private.requested) {
        return msg.author.send(`**${tvf.emojis.cross}  |**  You have already requested a session! If you want to request a new one, you must first cancel your session by running \`${prefix}private cancel\` and requesting a new one!`);
      }

      // generate an ID
      const id = shortid.generate();

      // alert the staff
      const embed = tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(msg.author.avatarURL())
        .setTitle(`${msg.author.username} has requested a private venting session!`)
        .setDescription(`Start the session now by typing \`${prefix}private start ${id}\` in the private venting channel.`)
        .addFields([
          {
            name: 'Session ID',
            value: id,
            inline: true,
          },
          {
            name: 'Venter ID',
            value: msg.author.id,
            inline: true,
          },
        ])
        .setFooter(`Session ID: ${id}`, msg.guild.iconURL());

      if (msg.guild.member(msg.author).nickname) {
        embed.addField('Venter Nickname', msg.guild.member(msg.author).nickname, true);
      }

      embed.addField('Reason', reason);

      tvf.channels.fk.send(tvf.isProduction ? tvf.roles.fk.toString() : '', embed);

      // send a message to the venter
      const venterEmbed = tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, author: true }, msg)
				.setTitle('Your private venting session has been requested.')
				.setDescription('Your session may begin quickly, or it may take some time - it depends on how busy we are, how many staff are available, and whether any staff are comfortable with taking it. Please remain online until your session begins. You\'ll recieve a ping from the server when we\'re ready for you. A few things to note before we start...')
				.addFields([
					{
						name: 'The 15 minutes rule',
						value: 'Private venting sessions typically only last fifteen minutes. As such, staff are not obliged to continue after this point. However, you can request more time.',
					},
					{
						name: 'Our staff are not counsellors or medical professionals',
						value: 'They can not offer you medical or deep life advice.',
					},
					{
						name: 'Who can view your session',
						value: 'Your sessions can be viewed by all staff members, but no-one else and staff are not allowed to share the contents elsewhere, **unless** you disclose that you or another are at serious risk, or you disclose something illegal.',
					},
					{
						name: 'The right to transfer',
						value: 'Staff reserve the right to transfer your session over to another for any given reason during your session.',
					},
				]);

			msg.author.send(venterEmbed);

      // update the document
      doc.private.requested = true;
      doc.private.id = id;
      doc.private.reason = reason;
      doc.private.requestedAt = new Date();

      tvf.saveDoc(doc);

      const venter = msg.guild.member(doc.id);

      // begin expiry countdown
      timeout.timeout(doc.private.id, tvf.privateTimeout, () => {
        // post an embed
        const expiryEmbed = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false })
          .setTitle(`${venter.user.username}'s private venting session has expired!`)
          .setThumbnail(venter.user.avatarURL())
          .addField('Venter ID', venter.id, true)
          .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

        if (venter.nickname) {
          expiryEmbed.addField('Venter Nickname', venter.nickname, true);
        }

        tvf.channels.fk.send(expiryEmbed);

        const venterEmbed = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false })
          .setTitle('Your private venting session has expired!')
          .setThumbnail(venter.user.avatarURL())
          .setDescription(stripIndents`
            We're sorry we couldn't get to your private venting session in time ):
            We automatically cancel old private venting sessions so that users can request new ones if they still need help, and to unclog the system!
            If you would still like some help, please do not be scared to request a new session! Thanks! (:
          `)

          venter.send(venterEmbed).catch(error => {
            tvf.logger.error(error)
            tvf.channels.discussion.send(stripIndents`
              <@!${venter.id}>, your private venting session has expired!
              Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please look into this this and ping newt#1234 if you need any help!
              If you still need a session, please do not fear to open a new one! Thanks (:
            `);
          });

        // cancel the session
        doc.private.requested = false;
        doc.private.id = null;
        doc.private.reason = null;
        doc.private.requestedAt = null;
        doc.private.startedAt = null;
        doc.private.takenBy = null;

        tvf.saveDoc(doc);
      });

      // expiry reminders
      const reminderEmbed = tvf.createEmbed({ colour: tvf.colours.orange, thumbnail: false, timestamp: true })
        .setThumbnail(venter.user.avatarURL())
        .setDescription(`Reason: ${reason}`)
        .addField('Session ID', doc.private.id, true)
        .addField('Venter ID', venter.id, true)
        .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

      if (venter.nickname) {
        reminderEmbed.addField('Venter Nickname', venter.nickname, true);
      }

      const hour = tvf.privateTimeout / 6;

      timeout.timeout(`${doc.private.id}1`, hour, () => tvf.channels.fk.send(reminderEmbed.setTitle(`${venter.user.username}'s session will expire in five hours!`)));
      timeout.timeout(`${doc.private.id}2`, hour * 2, () => tvf.channels.fk.send(reminderEmbed.setTitle(`${venter.user.username}'s session will expire in four hours!`)));
      timeout.timeout(`${doc.private.id}3`, hour * 3, () => tvf.channels.fk.send(reminderEmbed.setTitle(`${venter.user.username}'s session will expire in three hours!`)));
      timeout.timeout(`${doc.private.id}4`, hour * 4, () => tvf.channels.fk.send(reminderEmbed.setTitle(`${venter.user.username}'s session will expire in two hours!`)));
      timeout.timeout(`${doc.private.id}5`, hour * 5, () => tvf.channels.fk.send(tvf.isProduction ? tvf.roles.fk.toString() : '', reminderEmbed.setTitle(`${venter.user.username}'s session will expire in one hour!`)));
    }
  }
} as Command;
