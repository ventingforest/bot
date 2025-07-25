import type { GuildMember, PartialGuildMember } from "discord.js";

import { isProduction } from "$lib/data";
import { synchroniseMember } from "$lib/db";
import { config, Events, Listener, load } from "$listener";

@config(Events.GuildMemberRemove, {
	enabled: isProduction,
})
class MemberLeave extends Listener<typeof Events.GuildMemberRemove> {
	override async run(member: GuildMember | PartialGuildMember) {
		if (member.user.bot) return;
		await synchroniseMember(member, false);
	}
}

await load(MemberLeave);
