import User, { IUser } from '../../models/user';
import { stripIndents } from 'common-tags';
import moment from 'moment';
import Discord from 'discord.js';
import { nanoid } from 'nanoid';
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
    if (subcommand === 'start' && (tvf.isUser('Support', msg.member) || tvf.isUser('Admin', msg.member))) {
      await msg.delete();
      const id = args[1];

      // Try and find the user's document and begin updating it
      const doc = await User.findOne({ 'private.requested': true, 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);
      if (!doc) return msg.channel.send(tvf.emojiMessage(tvf.const.emojis.cross, `\`${id}\` is an invalid ID!`));
      const user = await tvf.users.fetch(doc.id);

      doc.private.requested = false;
      doc.private.startedAt = new Date();

      // Create a channel and vc for the private venting session to take place in
      const channel = await tvf.server.channels.create(`${user.username}-${user.discriminator}`, {
        parent: tvf.const.channels.staff.private.category,
        type: 'text',
        topic: `${tvf.const.emojis.tick}  |  Session started: ${moment(doc.private.startedAt).format(tvf.moment)} (id: ${doc.private.id})`,
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
            id: tvf.const.roles.staff.support,
            allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
          },
        ],
      });

      const vc = await tvf.server.channels.create(user.tag, {
        parent: tvf.const.channels.staff.private.category,
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
            id: tvf.const.roles.staff.support,
            allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
          },
        ],
      });

      // Welcome the user to private venting and mark the session as open
      channel.send(
        `Welcome to your private venting session, ${user.toString()} (:`,
        tvf.createEmbed({ colour: tvf.const.colours.green, timestamp: true, thumbnail: false })
          .setThumbnail(user.avatarURL())
          .setTitle(`Welcome to your private venting session, ${user.username}!`)
          .setDescription(`Reason for session: ${doc.private.reason}`)
          .setFooter(`Session ID: ${doc.private.id}`, tvf.server.iconURL())
      );

      // Inform the support team that the user's session has begun and post it in the logs
      const sessionBegun = tvf.createEmbed({ colour: tvf.const.colours.green, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.username}'s private venting session has been started by ${msg.author.username}!`)
        .setFooter(`Session ID: ${doc.private.id}`);

      tvf.const.channels.staff.support.send(sessionBegun);
      tvf.const.channels.staff.private.logs.send(sessionBegun);

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
    else if (subcommand === 'end' && (tvf.isUser('Support', msg.member) || tvf.isUser('Admin', msg.member))) {
      await msg.delete();
      const id = args[1];

      // Get notes from the command
      args.shift();
      args.shift();
      let notes = args.join(' ');
      if (!notes) notes = 'No notes provided.';

      // Try and find the user's document
      const doc = await User.findOne({ 'private.requested': false, 'private.id': id }, (err, res) => err ? tvf.logger.error(err) : res);
      if (!doc) return msg.channel.send(tvf.emojiMessage(tvf.const.emojis.cross, `\`${id}\` is an invalid ID!`));
      const user = await tvf.users.fetch(doc.id);

      // Fetch the channels associated with the session
      const text = tvf.server.channels.cache.get(doc.private.channels.text) as Discord.TextChannel;
      const vc = tvf.server.channels.cache.get(doc.private.channels.vc) as Discord.VoiceChannel;

      // Calculate important things for later
      const startedAt = moment(doc.private.startedAt).format(tvf.moment);
      const endedAt = moment(new Date()).format(tvf.moment);

      // Upload the message history to pastebin
      const messages = text.messages.cache;
      
      const paste = await tvf.pastebin.createPaste({
        title: `Private Venting Session - ${user.tag} - ${endedAt}`,
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
      const sessionEnded = tvf.createEmbed({ colour: tvf.const.colours.red, timestamp: true, thumbnail: false, author: true }, msg)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.username}'s session is over!`)
        .setDescription(notes)
        .addFields([
          { name: 'Time open', value: `${moment(new Date()).diff(moment(doc.private.startedAt), 'minutes')} minutes` },
          { name: 'Started at', value: startedAt, inline: true },
          { name: 'Ended at', value: endedAt, inline: true },
          { name: 'Reason', value: doc.private.reason },
          { name: 'Message count', value: messages.size, inline: true },
          { name: 'Pastebin', value: paste ? paste : 'Maximum daily paste upload met. Functionality will return in 24h.', inline: true },
        ])
        .setFooter(`Session ID: ${doc.private.id}`, tvf.server.iconURL());

      tvf.const.channels.staff.support.send(sessionEnded);
      tvf.const.channels.staff.private.logs.send(sessionEnded);

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
  }
} as Command;
