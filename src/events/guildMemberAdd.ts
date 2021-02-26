import * as Discord from 'discord.js';
import User from '../models/user';
import Client from '../Client';
import { stripIndents } from 'common-tags';

export default async (tvf: Client, member: Discord.GuildMember) => {
  if (tvf.isProduction) {
    // if the bot banner is enabled, and a bot joins the server
    if (tvf.config.botbanner && member.user.bot) {
      return member.ban({ reason: 'Bot banner is enabled!' });
    }

    // create a document in the database if one does not already exist
    if (!member.user.bot) {
      await User.findOne({ id: member.user.id }, (err, res) => {
        if (err) tvf.logger.error(err); 
        
        if (!res) {
          User.create({ id: member.user.id });

          // send a DM welcoming the user
          const dmEmbed = tvf.createEmbed()
            .setTitle('Welcome to The Venting Forest!')
            .setDescription('Welcome to TVF! We are a relatively large venting server that has been operating since April 2018, and we want to make you feel right at home!')
            .addFields([
              {
                name: 'I\'m in, so now what?',
                value: stripIndents`
                Now that you have joined our server, there are a couple things that you should know and that you need to do.
                First off, you must read ${tvf.const.channels.rules.toString()}, as it contains the majority of what you need to know.
                You can find out about our staff in ${tvf.const.channels.meetTheStaff.toString()}.
                When you are ready, please verify yourself in ${tvf.const.channels.verification.toString()}!
                You should then visit ${tvf.const.channels.roles.toString()}, where you can assign some cool roles to yourself that will allow you to access hidden channels.
              `,
              },
              {
                name: 'What should I do if I spot a rule breaker?',
                value: 'You can report rule breakers to our moderation team using the `?report` command! The format is `?report @user [reason]`',
              },
              {
                name: 'What is private venting?',
                value: stripIndents`
                We provide a service known as private venting, in which you can vent one-on-one with a member of our lovely staff team.

                You can request one of these sessions using the \`${tvf.prefix}private\` command. The format is \`${tvf.prefix}private [reason]\`.
                You may also cancel your session using the \`${tvf.prefix}private cancel\` command. Providing a reason is always appreciated.
              `,
              },
              {
                name: 'How to use our venting channels...',
                value: stripIndents`
                We have seen many people enter our server and going straight to a venting channel to say something along the lines of "is anyone there", not getting a response, and leaving.
                This is not how we use our venting channels. Please start venting as soon as you enter the channel, and if you want a response quickly, ping the **Helper** role.

                If you want to DM someone, visit the channel for your topic and ask if anyone can DM with them, and include the topic and any preferences you may have.

                Please be courteous towards others at all times, and **do not encourage self-harm or suicide**. If you are caught doing this, you will be banned.
              `,
              },
            ])
            .setFooter('The Venting Forest, serving users across the world since April 2018.', member.guild.iconURL());

          member.send(dmEmbed);
        }
      });

      const doc = await tvf.userDoc(member.user.id);

      if (doc !== null) {
        if (doc.stickyRoles.length > 0) {
          doc.stickyRoles.forEach(r => member.roles.add(r, 'Sticky roles!'));
          doc.stickyRoles = [];
        }
  
        // If the user was previously isolated, hide all the channels again
        if (doc.isolation.isolated) {
          tvf.server.channels.cache.forEach(c => {
            if (c.type === 'text' || c.type === 'news') c.updateOverwrite(member, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
            if (c.type === 'voice') c.updateOverwrite(member, { VIEW_CHANNEL: false, CONNECT: false });
          });
          
          const text = tvf.server.channels.cache.get(doc.isolation.channels.text) as Discord.TextChannel;
          const vc = tvf.server.channels.cache.get(doc.isolation.channels.vc) as Discord.VoiceChannel;
  
          text.updateOverwrite(member, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
          vc.updateOverwrite(member, { VIEW_CHANNEL: true, CONNECT: true });
  
          tvf.const.channels.general.send(`**${member.user.username}** is currently isolated! They may not respond to your messages for a while.`);
          text.send(`<@!${member.id}> Welcome back to the server! You are still isolated - if you feel like you are ready to come out, please ping a member of staff.`);
        }
  
        tvf.saveDoc(doc);
      }
    }

    // welcome the user in #the_enchanted_woods
    const welcomeEmbed = tvf.createEmbed({ thumbnail: false })
      .setTitle(`Welcome to TVF, ${member.user.username}!`)
      .setThumbnail(member.user.avatarURL())
      .setDescription(stripIndents`
				This may be a somewhat large server, but we can certainly make you feel at home - that's what our **Welcome Team** is for!
        **First of all, check out ${tvf.const.channels.rules} as it contains much of what you need to know, and ${tvf.const.roles}, which you can self-assign.**
        We hope you have fun and enjoy your stay here at The Venting Forest!
			`);

    const msg = await tvf.const.channels.general.send(`**Welcome to TVF, <@!${member.id}>!** ${member.id === '625919227651555348' || member.id === '326767126406889473' || member.user.bot ? '' : `(${tvf.const.roles.community.welcomeTeam.toString()})`}`, welcomeEmbed);
    msg.react(tvf.const.emojis.wave);
  }
};
