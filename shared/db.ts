import { PrismaClient } from "$prisma";

// connect to the database
const prisma = new PrismaClient({
	log: [
		{ emit: "event", level: "info" },
		{ emit: "event", level: "warn" },
		{ emit: "event", level: "error" },
	],
});

export default prisma;
