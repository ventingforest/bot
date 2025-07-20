import type { GuildMember } from "discord.js";
import { Listener, Events, config } from "$listener";
import { synchroniseMember } from "$lib/db";
import { isProduction } from "$lib/data";

@config(Events.GuildMemberAdd, {
	enabled: isProduction,
})
export class MemberJoin extends Listener<typeof Events.GuildMemberAdd> {
	override async run(member: GuildMember) {
		if (member.user.bot) return;
		await synchroniseMember(member);
	}
}
