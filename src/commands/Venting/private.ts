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

    // Handle the starting of a session
    if (subcommand === 'start' &&(tvf.isUser('Support', msg.author) || tvf.isUser('Admin', msg.author))) {
      await msg.delete();
      const id = args[1];

      // Try and find the user's document and begin updating it
      const doc = await User.findOne({ 'private.requested': true, 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);
      if (!doc) return msg.channel.send(tvf.emojiMessage(tvf.emojis.cross, `\`${id}\` is an invalid ID!`));
      const user = msg.guild.member(doc.id).user;

      doc.private.requested = false;
      doc.private.startedAt = new Date();

      // Create a channel and vc for the private venting session to take place in
      const channel = await tvf.server.channels.create(`${user.username}-${user.discriminator}`, {
        parent: tvf.channels.staff.private.category,
        type: 'text',
        topic: `${tvf.emojis.tick}  |  Session started: ${moment(doc.private.startedAt).format(tvf.moment)} (id: ${doc.private.id})`,
        permissionOverwrites: [
          {
            id: tvf.server.roles.everyone,
            allow: ['READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'],
            deny: ['VIEW_CHANNEL', 'ADD_REACTIONS', 'SEND_TTS_MESSAGES'],
          },
          {
            id: user.id,
            allow: 'VIEW_CHANNEL',
          },
          {
            id: tvf.roles.staff.support,
            allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
          },
        ],
      });

      const vc = await tvf.server.channels.create(user.tag, {
        parent: tvf.channels.staff.private.category,
        type: 'voice',
        permissionOverwrites: [
          {
            id: tvf.server.roles.everyone,
            allow: ['CONNECT', 'SPEAK', 'STREAM'],
            deny: 'VIEW_CHANNEL',
          },
          {
            id: user.id,
            allow: 'VIEW_CHANNEL',
          },
          {
            id: tvf.roles.staff.support,
            allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
          },
        ],
      });

      // Welcome the user to private venting and mark the session as open
      channel.send(
        `Welcome to your private venting session, ${user.toString()} (:`,
        tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false })
          .setThumbnail(user.avatarURL())
          .setTitle(`Welcome to your private venting session, ${user.username}!`)
          .setDescription(`Reason for session: ${doc.private.reason}`)
          .setFooter(`Session ID: ${doc.private.id}`, tvf.server.iconURL())
      );

      // Inform the support team that the user's session has begun and post it in the logs
      const sessionBegun = tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.username}'s private venting session has been started by ${msg.author.username}!`)
        .setFooter(`Sesssion ID: ${doc.private.id}`);

      tvf.channels.staff.support.send(sessionBegun);
      tvf.channels.staff.private.logs.send(sessionBegun);

      // Finsh updating the user's document
      doc.private.channels.text = channel.id;
      doc.private.channels.vc = vc.id;
      
      tvf.saveDoc(doc);

      // Clear the expiry reminders
      timeout.timeout(doc.private.id, null);
			timeout.timeout(`${doc.private.id}1`, null);
			timeout.timeout(`${doc.private.id}2`, null);
			timeout.timeout(`${doc.private.id}3`, null);
			timeout.timeout(`${doc.private.id}4`, null);
			timeout.timeout(`${doc.private.id}5`, null);
    }

    // Handle the ending of a session
    else if (subcommand === 'end' && (tvf.isUser('Support', msg.author) || tvf.isUser('Admin', msg.author))) {
      await msg.delete();
      const id = args[1];

      // Get notes from the command
      args.shift();
      args.shift();
      let notes = args.join(' ');
      if (!notes) notes = 'No notes provided.';

      // Try and find the user's document
      const doc = await User.findOne({ 'private.requested': false, 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);
      if (!doc) return msg.channel.send(tvf.emojiMessage(tvf.emojis.cross, `\`${id}\` is an invalid ID!`));
      const user = msg.guild.member(doc.id).user;

      // Fetch the channels associated with the session
      const text = tvf.server.channels.cache.get(doc.private.channels.text) as Discord.TextChannel;
      const vc = tvf.server.channels.cache.get(doc.private.channels.vc) as Discord.VoiceChannel;

      // Calculate important things for later
      const startedAt = moment(doc.private.startedAt).format(tvf.moment);
      const endedAt = moment(new Date()).format(tvf.moment);

      // Upload the message history to pastebin
      const messages = text.messages.cache;
      
      const paste = await tvf.pastebin.createPaste({
        title: `Private Venting Session - ${user.tag} - ${moment(new Date()).format(tvf.moment)}`,
        text: stripIndents`
          Venter: ${user.tag} (${user.id})
          Reason: ${doc.private.reason}
          Started at: ${startedAt}
          Ended at: ${endedAt}
          Message count: ${messages.size}
          ----------------------------------
          ${messages.map(msg => `${moment(msg.createdTimestamp).format('D/M/YYYY HH:MM')} ${msg.author.tag}: ${msg.content}`).join('\n')}
        `,
        format: null,
        privacy: 1,
      });

      // Inform the support team that the session has ended and post it in the logs 
      const sessionEnded = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.username}'s session is over!`)
        .setDescription(notes)
        .addFields([
          { name: 'Time open', value: `${moment(new Date()).diff(moment(doc.private.startedAt), 'minutes')} minutes` },
          { name: 'Started at', value: startedAt },
          { name: 'Ended at', value: endedAt },
          { name: 'Reason', value: doc.private.reason },
          { name: 'Message count', value: messages.size, inline: true },
          { name: 'Pastebin', value: paste ? paste : 'Maximum daily paste upload met. Functionality will return in 24h.', inline: true },
        ])
        .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

      tvf.channels.staff.support.send(sessionEnded);
      tvf.channels.staff.private.logs.send(sessionEnded);

      // Delete the channels associated with the session
      await text.delete();
      await vc.delete();

      // Update the user's document
      doc.private.id = null;
      doc.private.reason = null;
      doc.private.requested = null;
      doc.private.requestedAt = null;
      doc.private.startedAt = null;
      doc.private.channels.text = null;
      doc.private.channels.vc = null;
      
      return tvf.saveDoc(doc);
    }

    // Handle the cancellation of a session
    else if (subcommand === 'cancel') {
      await msg.delete(); // Delete the user's message
      let doc: IUser;

      // From the message, fetch the reason and/or ID
      const id = args[1];
      args.shift();

      let reason = args.join(' ');
      if (!reason) reason = 'No reason specified.';

      // If a member of the support team wishes to cancel a user's private venting session
      if (id && (tvf.isUser('Support', msg.author) || tvf.isUser('Admin', msg.author))) {
        doc = await User.findOne({ 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);
        const venter = tvf.server.members.cache.get(doc.id); // Get the venter by their ID

        // Correct the reason
        args.shift();
        reason = args.join(' ');
        if (!reason) reason = 'No reason specified.';

        // Inform the support team that the venter's session has been cancelled and post it in the logs
        const cancelled = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
          .setThumbnail(venter.user.avatarURL())
          .setTitle(`${msg.author.username} has cancelled ${venter.user.username}'s session`)
          .setDescription(`Reason: ${reason}`)
          .addFields([
            { name: 'Venter ID', value: venter.id, inline: true },
            { name: 'Canceller ID', value: msg.author.id, inline: true }
          ])
          .setFooter(`Session ID: ${doc.private.id}`, tvf.server.iconURL());

        tvf.channels.staff.support.send(cancelled);
        tvf.channels.staff.private.logs.send(cancelled);

        // Send the user a message informing them that their session has been cancelled
        venter.send(
          tvf.createEmbed({ colour: tvf.colours.red, timestamp: true })
            .setTitle('A member of the support team has cancelled your private venting session.')
            .setDescription('If you believe this has been done in error, please do not hesitate to contact a member of the support team - or request a new session!')
            .addField('Reason', reason)
        ).catch(() => tvf.channels.community.discussion.send(stripIndents`
          <@!${venter.id}>, your private venting session has been cancelled!
          Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please consider investigating this.
          If you believe this has been done in error, don't hesitate to contact a member of staff - or request a new session!
        `));
      }

      // If the user wants to cancel their own session
      else {
        doc = await tvf.userDoc(msg.author.id); // Get the user's document from the database
        if (!doc.private.requested) return msg.author.send(tvf.emojiMessage(tvf.emojis.cross, 'Sorry, you do not have a pending private venting session to cancel!'));

        // Inform the support team that the venter has cancelled their session and post it in the logs
        const cancelled = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
          .setTitle(`${msg.author.username} has cancelled their private venting session!`)
          .setDescription(`Reason: ${reason}`)
          .addField('User ID', msg.author.id, true)
          .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

        tvf.channels.staff.support.send(cancelled);
        tvf.channels.staff.private.logs.send(cancelled);
      }

      // Cancel the session

      // Clear the expiry reminders
      timeout.timeout(doc.private.id, null);
			timeout.timeout(`${doc.private.id}1`, null);
			timeout.timeout(`${doc.private.id}2`, null);
			timeout.timeout(`${doc.private.id}3`, null);
			timeout.timeout(`${doc.private.id}4`, null);
      timeout.timeout(`${doc.private.id}5`, null);
      
      // Update the venter's document
      doc.private.requested = false;
      doc.private.id = null;
      doc.private.reason = null;
      doc.private.requestedAt = null;
      doc.private.startedAt = null;
      doc.private.channels.text = null;
      doc.private.channels.vc = null;
      
      return tvf.saveDoc(doc);
    }

    // Handle the requesting of a session
    else {
      await msg.delete(); // Delete the user's message
      const doc = await tvf.userDoc(msg.author.id); // Get the user's document
      const id = shortid.generate(); // Generate an ID for later
      const hour = 3600000; // An hour in ms

      // From the message, fetch the reason
      const reason = args.join(' ');
      if (!reason) return msg.author.send(tvf.emojiMessage(tvf.emojis.cross, 'You must provide a reason for your session!'));

      // Ensure that the user hasn't already got a pending session
      if (doc.private.requested) return msg.author.send(tvf.emojiMessage(tvf.emojis.cross, `You already have a pending session! If you would like to request a new one, please first cancel your pending session by running \`${prefix}private cancel\`!`));

      // Update the user's document to reflect the changes
      doc.private.requested = true;
      doc.private.id = id;
      doc.private.reason = reason;
      doc.private.requestedAt = new Date();

      tvf.saveDoc(doc);

      // Alert the support team that a new private venting session has been requested and post in the logs
      const sessionRequested = tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false, author: true }, msg)
          .setThumbnail(msg.author.avatarURL()) // Make the thumnbail the user's profile picture
          .setTitle(`${msg.author.username} has requested a private venting session!`)
          .setDescription(`Begin the session now by typing \`${prefix}private start ${doc.private.id}\` in this channel!`)
          .addFields([
            { name: 'Reason', value: doc.private.reason },
            { name: 'Session ID', value: doc.private.id, inline: true },
            { name: 'Venter ID', value: msg.author.id, inline: true },
          ])
          .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

      tvf.channels.staff.support.send(tvf.isProduction ? tvf.roles.staff.support.toString() : '', sessionRequested);
      tvf.channels.staff.private.logs.send(sessionRequested);

      // Send the user a message confirming that their session has been requested
      msg.author.send(
        tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, author: true }, msg)
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
          ])
        );

        // Begin the expiry countdown
        timeout.timeout(doc.private.id, tvf.privateTimeout, () => {
          // Cancel the private venting session
          doc.private.requested = false;
          doc.private.id = null;
          doc.private.reason = null;
          doc.private.requestedAt = null;
          doc.private.startedAt = null;
          doc.private.channels.text = null;
          doc.private.channels.vc = null;

          tvf.saveDoc(doc);

          // Inform the support team that the user's session has expired
          tvf.channels.staff.support.send(
            tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
              .setThumbnail(msg.author.avatarURL())
              .setTitle(`${msg.author.username}'s private venting session has expired!`)
              .addField('Venter ID', msg.author.id, true)
              .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL())
          );

          // Inform the user that their session has expired
          msg.author.send(
            tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, author: true }, msg)
              .setTitle('Your private venting session has expired!')
              .setDescription(stripIndents`
                We're sorry we couldn't get to your private venting session in time ):
                We automatically cancel old private venting sessions so that users can request new ones if they still need help, and to unclog the system!
                If you would still like some help, please do not be scared to request a new session! Thanks! (:
              `)
          ).catch(() => tvf.channels.community.discussion.send(stripIndents`
            <@!${msg.author.id}>, your private venting session has expired!
            Normally this message would be sent in DMs, but the bot couldn't DM you for some reason - please look into this this and ping newt#1234 if you need any help!
            If you still need a session, please do not fear to open a new one! Thanks (:
          `));
        });

        // Create reminders for the expiry
        const reminderEmbed = tvf.createEmbed({ colour: tvf.colours.orange, timestamp: true, thumbnail: false, author: true }, msg)
          .setThumbnail(msg.author.avatarURL())
          .setDescription(`Reason: ${reason}`)
          .addFields([
            { name: 'Session ID', value: doc.private.id, inline: true },
            { name: 'Venter ID', value: msg.author.id, inline: true },
          ])
          .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL());

        timeout.timeout(`${doc.private.id}1`, hour, () => tvf.channels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in five hours!`)));
        timeout.timeout(`${doc.private.id}2`, hour * 2, () => tvf.channels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in four hours!`)));
        timeout.timeout(`${doc.private.id}3`, hour * 3, () => tvf.channels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in three hours!`)));
        timeout.timeout(`${doc.private.id}4`, hour * 4, () => tvf.channels.staff.support.send(reminderEmbed.setTitle(`${msg.author.username}'s session will expire in two hours!`)));
        timeout.timeout(`${doc.private.id}5`, hour * 5, () => tvf.channels.staff.support.send(tvf.isProduction ? tvf.roles.staff.support.toString() : '', reminderEmbed.setTitle(`${msg.author.username}'s session will expire in one hour!`)));
    }
  }
} as Command;
