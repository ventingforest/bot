import { Listener } from "@sapphire/framework";
import type { Client } from "discord.js";
import { synchronise } from "src/db";

export class ReadyListener extends Listener<"ready"> {
  override async run(client: Client<true>) {
    this.container.logger.info`Logged in as ${client.user?.tag}`;
    await synchronise(client, this.container.logger);
  }
}
