import type { GuildMember } from "discord.js";

import { isProduction } from "$lib/data";
import { synchroniseMember } from "$lib/db";
import { config, Events, Listener } from "$listener";

@config(Events.GuildMemberAdd, {
	enabled: isProduction,
})
export class MemberJoin extends Listener<typeof Events.GuildMemberAdd> {
	override async run(member: GuildMember) {
		if (member.user.bot) return;
		await synchroniseMember(member);
	}
}
