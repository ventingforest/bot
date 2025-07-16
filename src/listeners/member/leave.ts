import type { GuildMember, PartialGuildMember } from "discord.js";
import { Listener, Events, Config } from "$lib/listener";
import { synchroniseMember } from "$lib/db";

@Config(Events.GuildMemberRemove, {
  enabled: process.env.NODE_ENV === "production",
})
export class MemberLeave extends Listener<typeof Events.GuildMemberRemove> {
  override async run(member: GuildMember | PartialGuildMember) {
    if (member.user.bot) return;

    await synchroniseMember(member, false);
  }
}
