import type { GuildMember, PartialGuildMember } from "discord.js";
import { Listener, Events, config } from "$listener";
import { synchroniseMember } from "$lib/db";
import { isProduction } from "$lib/data";

@config(Events.GuildMemberRemove, {
	enabled: isProduction,
})
export class MemberLeave extends Listener<typeof Events.GuildMemberRemove> {
	override async run(member: GuildMember | PartialGuildMember) {
		if (member.user.bot) return;
		await synchroniseMember(member, false);
	}
}
