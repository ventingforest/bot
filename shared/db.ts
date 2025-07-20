import { getLogger } from "@logtape/logtape";

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

// log prisma events
{
	const logger = getLogger("db");
	prisma.$on("info", ({ message }) => {
		logger.info(message);
	});
	prisma.$on("warn", ({ message }) => {
		logger.warn(message);
	});
	prisma.$on("error", ({ message }) => {
		logger.error(message);
	});
}

export default prisma;
