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

    // Handle the beginning of a session
    if (subcommand === 'start') {}

    // Handle the ending of a session
    else if (subcommand === 'end') {}

    // Handle the cancellation of a session
    else if (subcommand === 'cancel') {}

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

      // Alert the support team that a new private venting session has been requested
      tvf.channels.staff.support.send(
        tvf.isProduction ? tvf.roles.staff.support.toString() : '',
        tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false, author: true }, msg)
          .setThumbnail(msg.author.avatarURL()) // Make the thumnbail the user's profile picture
          .setTitle(`${msg.author.username} has requested a private venting session!`)
          .setDescription(`Begin the session now by typing \`${prefix}private start ${doc.private.id}\` in this channel!`)
          .addFields([
            { name: 'Session ID', value: doc.private.id, inline: true },
            { name: 'Venter ID', value: msg.author.id, inline: true },
          ])
          .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL())
      );

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
          doc.private.takenBy = null;
          tvf.saveDoc(doc);

          // Inform the support team that the user's session has expired
          tvf.channels.staff.support.send(
            tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false, author: true })
              .setThumbnail(msg.author.avatarURL())
              .setTitle(`${msg.author.username}'s private venting session has expired!`)
              .addField('Venter ID', msg.author.id, true)
              .setFooter(`Session ID: ${doc.private.id}`, msg.guild.iconURL())
          );

          // Inform the user that their session has expired
          msg.author.send(
            tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, author: true })
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
        const reminderEmbed = tvf.createEmbed({ colour: tvf.colours.orange, timestamp: true, thumbnail: false, author: true })
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
