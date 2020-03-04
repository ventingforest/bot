const staff: Command = {
	run: (tvf, msg, args) => {
		const role = args.join(' ').toLowerCase();

		const admins = msg.guild.roles.cache
			.get(tvf.roles.ADMIN)
			.members.concat(
				msg.guild.roles.cache.get(tvf.roles.TECHADMIN).members,
			);
		const mods = msg.guild.roles.cache
			.get(tvf.roles.MOD)
			.members.filter((m) => !m.roles.cache.has(tvf.roles.ADMIN))
			.filter((m) => !m.roles.cache.has(tvf.roles.TECHADMIN));
		const fks = msg.guild.roles.cache
			.get(tvf.roles.FK)
			.members.filter((m) => !m.roles.cache.has(tvf.roles.MOD))
			.filter((m) => !m.roles.cache.has(tvf.roles.ADMIN))
			.filter((m) => !m.roles.cache.has(tvf.roles.TECHADMIN));

		if (
			role === 'forest keeper' ||
            role === 'fk' ||
            role === 'forest keepers' ||
            role === 'fks'
		) {
			const embed = tvf.createEmbed('green')
				.setTitle('Forest Keepers')
				.setDescription(fks.map((fk) => `<@!${fk.user.id}>`))
				.addFields([
					{
						name: 'Amount',
						value: fks.size,
						inline: true,
					},
					{
						name: 'Online',
						value: fks.filter((fk) => fk.user.presence.status !== 'offline').size,
						inline: true,
					},
				]);

			return msg.channel.send(embed);
		}

		if (
			role === 'moderator' ||
            role === 'mod' ||
            role === 'moderators' ||
            role === 'mods'
		) {
			const embed = tvf.createEmbed('red')
				.setTitle('Moderators')
				.setDescription(mods.map((mod) => `<@!${mod.user.id}>`))
				.addFields([
					{
						name: 'Amount',
						value: mods.size,
						inline: true,
					},
					{
						name: 'Online',
						value: mods.filter((mod) => mod.user.presence.status !== 'offline').size,
						inline: true,
					},
				]);

			return msg.channel.send(embed);
		}

		if (
			role === 'administrator' ||
            role === 'admin' ||
            role === 'administrators' ||
            role === 'admins'
		) {
			const embed = tvf.createEmbed('blue')
				.setTitle('Administrators')
				.setDescription(admins.map((admin) => `<@!${admin.user.id}>`))
				.addFields([
					{
						name: 'Amount',
						value: admins.size,
						inline: true,
					},
					{
						name: 'Online',
						value: admins.filter((admin) => admin.user.presence.status !== 'offline').size,
						inline: true,
					},
				]);

			return msg.channel.send(embed);
		}
		else {
			const embed = tvf.createEmbed()
				.setTitle('Staff')
				.setDescription(
					`Total: **${admins.size + mods.size + fks.size}**`,
				)
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

			return msg.channel.send(embed);
		}
	},
	config: {
		name: 'staff',
		description:
            'Allows you to view statistics about the staff like how many are in each position and how many are online, or just view the staff.',
		module: 'Core',
		usage: '*position*',
		allowGeneral: false,
	},
};

export default staff;
