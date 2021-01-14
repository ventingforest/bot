import moment from 'moment';
import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export default {
  name: 'isolate',
  description: 'Isolates/unisolates a user!',
  args: true,
  usage: '<@user> [reason]',
  aliases: ['unisolate'],
  allowGeneral: true,
  staffAccess: ['Support', 'Moderation', 'Admin'],
  run: async (tvf, msg, args) => {
      const user = await tvf.resolveUser(msg, args[0]); // Get the mentioned user
      const member = tvf.server.member(user);
      const doc = await tvf.userDoc(user.id); // Get the member's document from the database

      args.shift(); // Shift the arguments to remove the user

      // Isolating the user
      if (!doc.isolation.isolated) {
        await msg.delete(); // Delete the message

        // Fetch the reason
        let reason = args.join(' ');
        if (!reason) reason = 'No reason specified';

        // Create a channel and vc for the isolated user
        const channel = await tvf.server.channels.create(`${user.username}-${user.discriminator}`, {
          parent: tvf.const.staffChannels.isolation.category,
          type: 'text',
          topic: `${tvf.const.tick}  |  Session started: ${moment(doc.isolation.isolatedAt).format(tvf.moment)}`,
          permissionOverwrites: [
            {
              id: tvf.server.roles.everyone,
              allow: ['READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'],
              deny: ['VIEW_CHANNEL', 'ADD_REACTIONS', 'SEND_TTS_MESSAGES'],
            },
            {
              id: tvf.const.staffRoles.support,
              allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES'],
            },
            {
              id: tvf.const.staffRoles.moderators,
              allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES'],
            }
          ],
        });

        const vc = await tvf.server.channels.create(user.tag, {
          parent: tvf.const.staffChannels.isolation.category,
          type: 'voice',
          permissionOverwrites: [
            {
              id: tvf.server.roles.everyone,
              allow: ['CONNECT', 'SPEAK', 'STREAM'],
              deny: 'VIEW_CHANNEL',
            },
            {
              id: tvf.const.staffRoles.support,
              allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER'],
            },
            {
              id: tvf.const.staffRoles.moderators,
              allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
            }
          ],
        });

        if (tvf.server.member(user)) {
          channel.createOverwrite(user, { VIEW_CHANNEL: true });
          vc.createOverwrite(user, { VIEW_CHANNEL: true });
        }

        channel.send(
          `Welcome to isolation, ${user.toString()}!`,
          tvf.createEmbed({ colour: tvf.const.green, timestamp: true, thumbnail: false })
            .setThumbnail(user.avatarURL())
            .setTitle(`Welcome to isolation, ${user.username}!`)
            .setDescription(`Hey there, ${user.username}! Welcome to isolation! You have been put here by a member of staff - but don't worry, this doesn't necessarily mean you have done something wrong. Staff put people here in order to help people calm down if you're feeling bad, or if you are harming other members of the server. Only you and the staff can see this channel, and it is completely private - feel free to talk to them.`)
        );

        // Hide every other channel from the isolated user and disconnect them from any vc they were in
        if (member.voice) member.voice.kick();

        tvf.server.channels.cache.filter(c => c.id !== channel.id && c.id !== vc.id).forEach(c => {
          if (c.type === 'text' || c.type === 'news') c.updateOverwrite(member, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
          if (c.type === 'voice') c.updateOverwrite(member, { VIEW_CHANNEL: false, CONNECT: false });
        });
        
        // Update the user's document
        doc.isolation.isolated = true;
        doc.isolation.isolatedAt = new Date();
        doc.isolation.isolatedBy = msg.author.id;
        doc.isolation.reason = reason;
        doc.isolation.channels.text = channel.id;
        doc.isolation.channels.vc = vc.id;
      
        tvf.saveDoc(doc);

        // Inform relevant staff that the user has been isolated and post it in the logs
        const isolated = tvf.createEmbed({ colour: tvf.const.red, thumbnail: false, author: true }, msg)
          .setThumbnail(user.avatarURL())
          .setTitle(`${user.username} has been isolated.`)
          .setDescription(`Reason: ${reason}`)
          .setFooter(`Isolated by ${msg.author.username} at ${moment(doc.isolation.isolatedAt).format(tvf.moment)}`, msg.author.avatarURL());

        tvf.const.staffChannels.moderators.chat.send(isolated);
        tvf.const.staffChannels.moderators.modlogs.send(isolated);
        tvf.const.staffChannels.support.send(isolated);
        tvf.const.staffChannels.isolation.logs.send(isolated);
      } 
      
      // Unisolating the user
      else {
        if (tvf.isUser('Moderation', msg.author)) {
          await msg.delete(); // Delete the message

          // Fetch any notes
          let notes = args.join(' ');
          if (!notes) notes = 'No notes provided';

          // Fetch the channels associated with the isolation
          const text = tvf.server.channels.cache.get(doc.isolation.channels.text) as Discord.TextChannel;
          const vc = tvf.server.channels.cache.get(doc.isolation.channels.vc) as Discord.VoiceChannel;

          // Calculate important things for later
          const isolatedAt = moment(doc.isolation.isolatedAt).format(tvf.moment);
          const unisolatedAt = moment(new Date()).format(tvf.moment);

          // Upload the message history to pastebin
          const messages = text.messages.cache;

          const paste = await tvf.pastebin.createPaste({
            title: `Isolation - ${user.tag} - ${unisolatedAt}`,
            text: stripIndents`
              User isolated: ${user.tag} (${user.id})
              Reason: ${doc.isolation.reason}
              Isolated at: ${isolatedAt}
              Unisolated at: ${unisolatedAt}
              Message count: ${messages.size}
              ----------------------------------
            ${messages.map(msg => `${moment(msg.createdTimestamp).format('D/M/YYYY HH:MM')} ${msg.author.tag}: ${msg.content}`).join('\n')}
            `,
            format: null,
            privacy: 1,
          });

          // Inform the support and moderation teams that the isolation is over and post it in the logs 
          const isolationEnded = tvf.createEmbed({ colour: tvf.const.red, timestamp: true, thumbnail: false, author: true }, msg)
            .setThumbnail(user.avatarURL())
            .setTitle(`${user.username} has been unisolated!`)
            .setDescription(notes)
            .addFields([
              { name: 'Time isolated', value: `${moment(new Date()).diff(moment(doc.isolation.isolatedAt), 'minutes')} minutes` },
              { name: 'Isolated at', value: isolatedAt, inline: true },
              { name: 'Unisolated at', value: unisolatedAt, inline: true },
              { name: 'Reason', value: doc.isolation.reason },
              { name: 'Notes', value: notes },
              { name: 'Isolated by', value: tvf.server.member(doc.isolation.isolatedBy).user.username, inline: true },
              { name: 'Unisolated by', value: msg.author.username, inline: true },
              { name: 'Message count', value: messages.size, inline: true },
              { name: 'Pastebin', value: paste ? paste : 'Maximum daily paste upload met. Functionality will return in 24h.', inline: true },
            ]);

        tvf.const.staffChannels.moderators.chat.send(isolationEnded);
        tvf.const.staffChannels.moderators.modlogs.send(isolationEnded);
        tvf.const.staffChannels.support.send(isolationEnded);
        tvf.const.staffChannels.isolation.logs.send(isolationEnded);

        if (tvf.server.member(user)) {
          // Give the user access to all other channels
          tvf.server.channels.cache.forEach(c => {
            const o = c.permissionOverwrites.get(user.id);
            if (o) o.delete();
          });
        }

        // Delete the channels associated with the session
        await text.delete();
        await vc.delete();

        // Update the user's document
        doc.isolation.isolated = false;
        doc.isolation.isolatedAt = null;
        doc.isolation.isolatedBy = null;
        doc.isolation.reason = null;
        doc.isolation.channels.text = null;
        doc.isolation.channels.vc = null;
      
        tvf.saveDoc(doc);
      } else {
        msg.channel.send(tvf.emojiMessage(tvf.const.cross, 'Sorry, support team members can not unisolate members. Please contact a moderator.'));
      }
    }
  }
} as Command;
