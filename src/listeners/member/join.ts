import { Listener, Events, Config } from "$lib/listener";
import type { GuildMember } from "discord.js";
import { synchroniseMember } from "$lib/db";

@Config(Events.GuildMemberAdd, {
  enabled: process.env.NODE_ENV === "production",
})
export class MemberJoin extends Listener<typeof Events.GuildMemberAdd> {
  override async run(member: GuildMember) {
    if (member.user.bot) return;
    await synchroniseMember(member);
  }
}
