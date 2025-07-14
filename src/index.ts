import {
  Client,
  GatewayIntentBits,
  type GuildTextBasedChannel,
} from "discord.js";
import processGuild from "./process";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const reportChannel = (await guild.channels.fetch(
    process.env.REPORT_CHANNEL_ID!,
  )) as GuildTextBasedChannel;

  const log = async (msg: string): Promise<void> => {
    await reportChannel.send(msg);
  };

  await log(`logged in as ${client.user?.tag}!`);
  await log(`starting XP calculation for guild: ${guild.name} (${guild.id})`);
  const stats = await processGuild(guild, log);
  await log(
    `All channels done.\nSummary:\nGuild: ${stats.guildName}\nMessages: ${stats.messageCount}\nUsers: ${stats.userCount}\nTotal XP: ${stats.totalXp}`,
  );
  await log(`sent completion message to channel #${reportChannel.name}`);
  await client.destroy();
});

client.login(process.env.BOT_TOKEN!);
