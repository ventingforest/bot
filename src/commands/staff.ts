export default {
  name: 'staff',
  description: 'Allows you to view statistics about the staff.',
  module: 'Core',
  usage: '<position>',
  examples: ['staff', 'staff fk'],
  allowGeneral: false,
  run: async (tvf, msg, args) => {
    const role = args.join(' ').toLowerCase();
    let embed = tvf.createEmbed({ timestamp: true });

    console.log(role);

    // group users by role
    const admins = tvf.roles.admin.members.concat(tvf.roles.techAdmin.members);
    const mods = tvf.roles.mod.members.filter(m => !m.roles.cache.has(tvf.roles.admin.id)).filter(m => !m.roles.cache.has(tvf.roles.techAdmin.id));
    const fks = tvf.roles.fk.members.filter(m => !m.roles.cache.has(tvf.roles.admin.id)).filter(m => !m.roles.cache.has(tvf.roles.techAdmin.id)).filter(m => !m.roles.cache.has(tvf.roles.mod.id));
    const staff = admins.concat(mods).concat(fks);

    // roles

    // forest keepers
    if (role === 'forest keeper' || role === 'fk' || role === 'forest keepers' || role === 'fks') {
      embed
        .setColor(tvf.colours.green)
        .setTitle(`Forest Keepers (${fks.size})`)
        .setDescription(fks.map(fk => `<@!${fk.user.id}>`))
        .addFields([
          {
            name: 'Online',
            value: fks.filter(fk => fk.user.presence.status !== 'offline').size,
            inline: true,
          },
        ]);
    }

    // moderators
    else if (role === 'moderator' || role === 'mod' || role === 'moderators' || role === 'mods') {
      embed
        .setColor(tvf.colours.red)
        .setTitle(`Moderators (${mods.size})`)
        .setDescription(mods.map(mod => `<@!${mod.user.id}>`))
        .addFields([
          {
            name: 'Online',
            value: mods.filter(mod => mod.user.presence.status !== 'offline').size,
            inline: true,
          },
        ]);
    }

    // administrators & tech admins
    else if (role === 'administrator' || role === 'admin' || role === 'administrators' || role === 'admins') {
      embed
        .setColor(tvf.colours.purple)
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
            name: `Moderators (${mods.size})`,
            value: mods.map(mod => `<@!${mod.user.id}>`),
            inline: true,
          },
          {
            name: `Forest Keepers (${fks.size})`,
            value: fks.map(fk => `<@!${fk.user.id}>`),
            inline: true,
          },
        ]);
    }

    // send the embed
    msg.channel.send(embed);
  }
} as Command;
