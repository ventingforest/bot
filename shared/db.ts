import { PrismaClient } from "$prisma";

if (!process.env.DATABASE_URL) {
	throw new Error(
		"No database URL provided. Please set the DATABASE_URL environment variable.",
	);
}

// connect to the database
const prisma = new PrismaClient({
	log: [
		{ emit: "event", level: "info" },
		{ emit: "event", level: "warn" },
		{ emit: "event", level: "error" },
	],
});

export default prisma;
