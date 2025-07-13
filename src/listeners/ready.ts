import { Listener } from "@sapphire/framework";
import type { Client } from "discord.js";
import { synchronise } from "$lib/db";

export class ReadyListener extends Listener<"ready"> {
  override async run(client: Client<true>) {
    this.container.logger.info`Logged in as ${client.user?.tag}`;

    if (process.env.NODE_ENV === "production") {
      await synchronise(client, this.container.logger);
    }
  }
}
