import { ActivityType, type Client } from "discord.js";
import { Events, Listener, Config } from "$listener";
import { synchroniseGuild } from "$lib/db";
import { isProduction } from "$lib/data";

@Config(Events.ClientReady, {
  once: true,
})
export class Ready extends Listener<typeof Events.ClientReady> {
  override async run(client: Client<true>) {
    client.user.setActivity("over you :]", { type: ActivityType.Watching });
    this.container.logger.info`Logged in as ${client.user?.tag}`;

    if (isProduction) {
      await synchroniseGuild();
    }
  }
}
