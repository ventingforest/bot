import type { GuildMember } from "discord.js";

import { isProduction } from "$lib/data";
import { synchroniseMember } from "$lib/db";
import { config, Events, Listener, load } from "$listener";
import { ensureCorrectLevelRole } from "$shared/level";

@config(Events.GuildMemberAdd, {
	enabled: isProduction,
})
class MemberJoin extends Listener<typeof Events.GuildMemberAdd> {
	override async run(member: GuildMember) {
		if (member.user.bot) return;
		await synchroniseMember(member);
		await ensureCorrectLevelRole(member);
	}
}

await load(MemberJoin);
