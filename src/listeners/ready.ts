import { Listener } from "@sapphire/framework";
import type { Client } from "discord.js";
import { synchroniseGuild } from "$lib/db";

const event = "ready";

export class Ready extends Listener<typeof event> {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event,
    });
  }

  override async run(client: Client<true>) {
    this.container.logger.info`Logged in as ${client.user?.tag}`;

    if (process.env.NODE_ENV === "production") {
      await synchroniseGuild();
    }
  }
}
