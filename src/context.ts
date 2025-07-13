import { PrismaClient } from "./generated/prisma";
import { getLogger } from "@logtape/logtape";
import { Client } from "discord.js";

export const client = new Client({
  intents: [],
});
export const prisma = new PrismaClient();
export const logger = getLogger(["bot"]);
