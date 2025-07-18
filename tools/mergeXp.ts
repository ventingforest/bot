import { hideBin } from "yargs/helpers";
import prisma from "$shared/db";
import yargs from "yargs";

// collect args
let {
  _: [toId, fromId], // reversed order
} = yargs(hideBin(process.argv))
  .usage("Usage: $0 <to> <from>") // update usage
  .number("to")
  .number("from")
  .demandCommand(2, "You must provide both <to> and <from> user IDs.")
  .help()
  .parseSync();

if (!toId || !fromId) {
  console.error("Error: Both <to> and <from> user IDs are required.");
  process.exit(1);
}

toId = toId.toString();
fromId = fromId.toString();

// fetch data
const users = await prisma.user.findMany({
  where: { id: { in: [toId, fromId] } },
});
const toUser = users.find(u => u.id === toId)!;
const fromUser = users.find(u => u.id === fromId)!;

// new xp
const xp = fromUser.xp + toUser.xp;
await prisma.user.update({
  where: { id: toId },
  data: { xp },
});

// delete fromUser
await prisma.user.delete({ where: { id: fromId } });
