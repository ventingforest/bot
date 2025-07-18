import { Client, type ClientOptions } from "discord.js";
import logger from "$lib/logger";
import token from "$lib/token";

export default async function createClient(
  options: ClientOptions = { intents: [] },
): Promise<Client> {
  const client = new Client(options);

  // add logging events
  client.on("debug", message => logger.debug(message));
  client.on("warn", message => logger.warn(message));
  client.on("error", ({ message }) => logger.error(message));

  await client.login(token);
  return client;
}
