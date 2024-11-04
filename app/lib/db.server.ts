import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";

export const prisma = remember("prisma", () => {
	const client = new PrismaClient();
	void client.$connect();
	return client;
});
