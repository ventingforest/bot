import { Listener } from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import { synchroniseMember } from "$lib/db";

const event = "guildMemberAdd";

export class MemberJoin extends Listener<typeof event> {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event,
      enabled: process.env.NODE_ENV === "production",
    });
  }

  override async run(member: GuildMember) {
    if (member.user.bot) return;
    await synchroniseMember(member);
  }
}
