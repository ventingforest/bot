import prisma from "$shared/db";

await prisma.anonVent.deleteMany({});
