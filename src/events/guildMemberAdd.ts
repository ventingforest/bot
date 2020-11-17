import * as Discord from 'discord.js';
import User from '../models/user';
import Client from '../Client';
import { Ban } from 'ksoft.js';
import { stripIndents } from 'common-tags';

export default async (tvf: Client, member: Discord.GuildMember) => {
  if (tvf.isProduction) {
    // if the bot banner is enabled, and a bot joins the server
    if (tvf.config.botbanner && member.user.bot) {
      return member.ban({ reason: 'Bot banner is enabled!' });
    }

    // ksoft.si ban api

    // if the user is in the ban list
    if (await tvf.ksoft.bans.check(member.id)) {
      // get information about the user's ban
      // @ts-ignore
      const data: Ban = await tvf.ksoft.bans.info(member.id);

      // if the ban is unappealable, ban the user
      if (!data.appealable) {
        await member.ban({ reason: `Unappealable ban on ksoft.si for ${data.reason} (proof: ${data.proof})`});
      } else {
        // send an alert to the fk channel, warning staff
        const embed = tvf.createEmbed({ colour: tvf.colours.red })
          .setTitle('A globally banned member has joined the server!')
          .setDescription(`They were banned for ${data.reason}.`)
          .addFields([
            {
              name: 'Tag',
              value: member.user.tag,
              inline: true,
            },
            {
              name: 'ID',
              value: member.id,
              inline: true,
            },
            {
              name: 'Proof',
              value: data.proof,
            },
          ]);

        tvf.channels.staff.support.send(tvf.roles.staff.support.toString(), embed);
      }
    }

    // create a document in the database
    User.create({ id: member.id });

    // send a DM welcoming the user
    const dmEmbed = tvf.createEmbed()
      .setTitle('Welcome to The Venting Forest!')
      .setDescription('Welcome to TVF! We are a relatively large venting server that has been operating since April 2018, and we want to make you feel right at home!')
      .addFields([
        {
          name: 'I\'m in, so now what?',
          value: stripIndents`
          Now that you have joined our server, there are a couple things that you should know and that you need to do.
          First off, you must read ${tvf.channels.rules.toString()}, as it contains the majority of what you need to know.
          If you have any questions, feel free to read our ${tvf.channels.community.faq.toString()}. You can also find out about our staff in ${tvf.channels.staff.meet.toString()}.
          When you are ready, please verify yourself in ${tvf.channels.verification.toString()}!
          You should then visit ${tvf.channels.roles.toString()}, where you can assign some cool roles to yourself that will allow you to access hidden channels.
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

    // welcome the user in #the_enchanted_woods
    const welcomeEmbed = tvf.createEmbed({ thumbnail: false })
      .setTitle(`Welcome to TVF, ${member.user.username}!`)
      .setThumbnail(member.user.avatarURL())
      .setDescription(stripIndents`
				This may be a somewhat large server, but we can certainly make you feel at home - that's what our **Welcome Team** is for!
        **First of all, check out ${tvf.channels.rules} as it contains much of what you need to know, and ${tvf.channels.roles}, which you can self-assign.**
        We hope you have fun and enjoy your stay here at The Venting Forest!
			`);

    const msg = await tvf.channels.general.send(`**Welcome to TVF, <@!${member.id}>!** ${member.id === '625919227651555348' || member.id === '326767126406889473' || member.user.bot ? '' : `(${tvf.roles.community.welcomeTeam.toString()})`}`, welcomeEmbed);
    return msg.react(tvf.emojis.wave);
  }
};
