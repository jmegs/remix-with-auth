import { pbkdf2Sync, randomBytes } from "node:crypto";
import type { User } from "@prisma/client";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { prisma } from "~/lib/db.server";
import { sessionStorage } from "./session.server";

export const auth = new Authenticator<User>(sessionStorage);

auth.use(
	new FormStrategy(async ({ form }) => {
		const email = String(form.get("email"));
		const password = String(form.get("password"));

		if (!email.includes("@")) {
			throw new AuthorizationError("Invalid email address");
		}

		if (password.length < 8) {
			throw new AuthorizationError("Password must be at least 8 characters");
		}

		const user = await findOrCreateUser(email, password);

		return user;
	})
);

async function findOrCreateUser(email: string, password: string) {
	const user = await prisma.user.findUnique({ where: { email } });

	if (user) {
		if (verifyPassword(password, user.salt, user.password)) {
			return user;
		}
		throw new AuthorizationError("Invalid email or password");
	}

	const { salt, hash: hashedPassword } = hashPassword(password);

	return prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			salt: salt,
		},
	});
}

type SecurePassword = { salt: string; hash: string };

function hashPassword(password: string): SecurePassword {
	const salt = randomBytes(16).toString("hex");
	const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
	return { salt, hash };
}

function verifyPassword(password: string, salt: string, storedHash: string) {
	const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
	return hash === storedHash;
}
