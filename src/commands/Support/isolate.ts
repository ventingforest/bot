import moment from 'moment';
import * as Discord from 'discord.js';

export default {
  name: 'isolate',
  description: 'Isolates/unisolates a user!',
  args: true,
  usage: '<@user> [reason]',
  aliases: ['unisolate'],
  allowGeneral: true,
  staffAccess: ['Support', 'Moderation'],
  run: async (tvf, msg, args) => {
    await msg.delete(); // Delete the message
    args.shift(); // Shift the arguments to remove the user

    if (tvf.isUser('Support', msg.author) || tvf.isUser('Moderation', msg.author) || tvf.isUser('Admin', msg.author)) {
      const member = tvf.checkForMember(msg, args); // Get the mentioned member
      const doc = await tvf.userDoc(member.user.id); // Get the member's document from the database

      // Fetch the reason
      let reason = args.join(' ');
      if (!reason) reason = 'No reason specified';

      // Isolating the user
      if (!doc.isolation.isolated) {
        // Create a channel and vc for the isolated user
        const channel = await tvf.server.channels.create(`${member.user.username}-${member.user.discriminator}`, {
          parent: tvf.channels.staff.isolation.category,
          type: 'text',
          topic: `${tvf.emojis.tick}  |  Session started: ${moment(doc.isolation.isolatedAt).format(tvf.moment)}`,
          permissionOverwrites: [
            {
              id: tvf.server.roles.everyone,
              allow: ['READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'],
              deny: ['VIEW_CHANNEL', 'ADD_REACTIONS', 'SEND_TTS_MESSAGES'],
            },
            {
              id: member.id,
              allow: 'VIEW_CHANNEL',
            },
            {
              id: tvf.roles.staff.support,
              allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES'],
            },
            {
              id: tvf.roles.staff.moderators,
              allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES'],
            },
          ],
        });

        const vc = await tvf.server.channels.create(member.user.tag, {
          parent: tvf.channels.staff.private.category,
          type: 'voice',
          permissionOverwrites: [
            {
              id: tvf.server.roles.everyone,
              allow: ['CONNECT', 'SPEAK', 'STREAM'],
              deny: 'VIEW_CHANNEL',
            },
            {
              id: member.id,
              allow: 'VIEW_CHANNEL',
            },
            {
              id: tvf.roles.staff.support,
              allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER'],
            },
            {
              id: tvf.roles.staff.moderators,
              allow: ['VIEW_CHANNEL', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'PRIORITY_SPEAKER']
            },
          ],
        });

        channel.send(
          `Welcome to isolation, ${member.toString()}!`,
          tvf.createEmbed({ colour: tvf.colours.green, timestamp: true, thumbnail: false })
            .setThumbnail(member.user.avatarURL())
            .setTitle(`Welcome to isolation, ${member.user.username}!`)
            .setDescription(`Hey there, ${member.user.username}! Welcome to isolation! You have been put here by a member of staff - but don't worry, this doesn't necessarily mean you have done something wrong. Staff put people here in order to help people calm down if you're feeling bad, or if you are harming other members of the server. Only you and the staff can see this channel, and it is completely private - feel free to talk to them.`)
        );

        // Hide every other channel from the isolated user
        tvf.server.channels.cache.filter(c => c.id !== channel.id && c.id !== vc.id).forEach(c => c.updateOverwrite(member, { VIEW_CHANNEL: false }));
        
        // Update the user's document
        doc.isolation.isolated = true;
        doc.isolation.isolatedAt = new Date();
        doc.isolation.reason = reason;
        doc.isolation.channels.text = channel.id;
        doc.isolation.channels.vc = vc.id
      
        tvf.saveDoc(doc);

        // Inform relevant staff that the user has been isolated and post it in the logs
        const isolated = tvf.createEmbed({ colour: tvf.colours.red, thumbnail: false, author: true }, msg)
          .setThumbnail(member.user.avatarURL())
          .setTitle(`${member.user.username} has been isolated.`)
          .setDescription(`Reason: ${reason}`)
          .setFooter(`Isolated by ${msg.author.username} at ${moment(doc.isolation.isolatedAt).format(tvf.moment)}`, msg.author.avatarURL());

        tvf.channels.staff.moderators.chat.send(isolated);
        tvf.channels.staff.moderators.modlogs.send(isolated);
        tvf.channels.staff.support.send(isolated);
        tvf.channels.staff.isolation.logs.send(isolated);
      } 
      
      // Unisolating the user
      else {
        msg.channel.send('Coming soon!')
      }
    } else {
      msg.author.send(`**${tvf.emojis.cross}  |**  you are not allowed to run this command.`)
    }
  }
} as Command;
