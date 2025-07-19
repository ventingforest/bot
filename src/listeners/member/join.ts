import { Listener, Events, Config } from "$listener";
import type { GuildMember } from "discord.js";
import { synchroniseMember } from "$lib/db";
import { isProduction } from "$lib/data";

@Config(Events.GuildMemberAdd, {
  enabled: isProduction,
})
export class MemberJoin extends Listener<typeof Events.GuildMemberAdd> {
  override async run(member: GuildMember) {
    if (member.user.bot) return;
    await synchroniseMember(member);
  }
}
