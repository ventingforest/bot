import { Client } from "discord.js";
import { PrismaClient } from "./generated/prisma";
import { getLogger } from "@logtape/logtape";

export const client = new Client({
  intents: [],
});
export const prisma = new PrismaClient();
export const logger = getLogger(["bot"]);
