export default {
  name: 'staff',
  description: 'Allows you to view statistics about the staff.',
  usage: '<position>',
  allowGeneral: false,
  run: async (tvf, msg, args) => {
    const role = args.join(' ').toLowerCase();
    let embed = tvf.createEmbed({ timestamp: true });

    // group users by role
    const admins = tvf.roles.staff.admins.members;
    const engagement = tvf.roles.staff.engagement.members;
    const support = tvf.roles.staff.support.members;
    const moderators = tvf.roles.staff.moderators.members;
    const staff = tvf.roles.staff.staff.members;

    // roles

    // administrators
    if (role === 'administrator' || role === 'admin' || role === 'administrators' || role === 'admins') {
      embed
        .setColor(tvf.colours.yellow)
        .setTitle(`Administrators (${admins.size})`)
        .setDescription(admins.map(admin => `<@!${admin.user.id}>`))
        .addFields([
          {
            name: 'Online',
            value: admins.filter(admin => admin.user.presence.status !== 'offline').size,
            inline: true,
          },
        ]);
    }

    // engagement
    if (role === 'engagement') {
      embed
        .setColor(tvf.colours.staff.engagement)
        .setTitle(`Engagement (${engagement.size})`)
        .setDescription(engagement.map(e => `<@!${e.user.id}>`))
        .addFields([
          {
            name: 'Online',
            value: engagement.filter(e => e.user.presence.status !== 'offline').size,
            inline: true,
          },
        ]);
    }

    // support
    else if (role === 'support') {
      embed
        .setColor(tvf.colours.staff.support)
        .setTitle(`Support (${support.size})`)
        .setDescription(support.map(s => `<@!${s.user.id}>`))
        .addFields([
          {
            name: 'Online',
            value: support.filter(s => s.user.presence.status !== 'offline').size,
            inline: true,
          },
        ]);
    }

    // moderators
    else if (role === 'moderator' || role === 'mod' || role === 'moderators' || role === 'moderators') {
      embed
        .setColor(tvf.colours.staff.moderation)
        .setTitle(`Moderators (${moderators.size})`)
        .setDescription(moderators.map(mod => `<@!${mod.user.id}>`))
        .addFields([
          {
            name: 'Online',
            value: moderators.filter(mod => mod.user.presence.status !== 'offline').size,
            inline: true,
          },
        ]);
    }

    // staff list

    else {
      embed
        .setTitle(`Staff (${staff.size})`)
        .addFields([
          {
            name: `Administrators (${admins.size})`,
            value: admins.map(admin => `<@!${admin.user.id}>`),
            inline: true,
          },
          {
            name: `Moderators (${moderators.size})`,
            value: moderators.map(mod => `<@!${mod.user.id}>`),
            inline: true,
          },
          {
            name: `Engagement (${engagement.size})`,
            value: engagement.map(e => `<@!${e.user.id}>`),
            inline: true,
          },
          {
            name: `Support (${support.size})`,
            value: support.map(s => `<@!${s.user.id}>`),
            inline: true,
          },
        ]);
    }

    // send the embed
    msg.channel.send(embed);
  }
} as Command;
