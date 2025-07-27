import prisma from "$shared/db";

await prisma.anon.deleteMany({});
