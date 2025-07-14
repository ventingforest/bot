import type { OmitPartialGroupDMChannel, Message } from "discord.js";
import { Listener } from "@sapphire/framework";
import { prisma } from "$lib/db";
import { xp } from "$lib/const";

const event = "messageCreate";

export class GiveXp extends Listener<typeof event> {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event,
    });
  }

  override async run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.bot) return; // ignore bot messages
    if (!message.guild) return; // ensure it's a guild message

    const xp = computeXp(message);
    console.log(message.content.length);
    this.container.logger.info`Giving ${xp} XP to ${message.author.username}`;

    if (process.env.NODE_ENV === "production") {
      await prisma.user.update({
        where: { id: message.author.id },
        data: { xp: { increment: xp } },
      });
    }
  }
}

// keeps the last time a user sent a message
const lastTime = new Map<string, number>();

function computeXp({
  author: { id },
  createdTimestamp: time,
  content: { length },
}: Message): number {
  const last = lastTime.get(id) || 0;

  if (time - last < xp.cooldown) {
    // within cooldown period, no XP
    return 0;
  }

  lastTime.set(id, time);

  const points = Math.floor(length / xp.charsPerPoint);
  return Math.min(xp.minimum + points, xp.maximum);
}
