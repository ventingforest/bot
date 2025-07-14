import type { GuildMember, PartialGuildMember } from "discord.js";
import { Listener } from "@sapphire/framework";
import { synchroniseMember } from "$lib/db";

const event = "guildMemberRemove";

export class MemberLeave extends Listener<typeof event> {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event,
    });
  }

  override async run(member: GuildMember | PartialGuildMember) {
    if (process.env.NODE_ENV === "production") {
      await synchroniseMember(member, false);
    }
  }
}
