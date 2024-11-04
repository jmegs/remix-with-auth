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

		guard(email.includes("@"), "Invalid email address", AuthorizationError);
		guard(password.length >= 8, "Password must be at least 8 characters", AuthorizationError);

		const user = await findOrCreateUser(email, password);

		return user;
	})
);

function guard(
	condition: unknown,
	message: string,
	ErrorConstructor: new (message: string) => Error = Error
): asserts condition {
	if (condition) return;
	throw new ErrorConstructor(message);
}

async function findOrCreateUser(
	email: string,
	password: string
) {
	const user = await prisma.user.findUnique({ where: { email } });

	if (user) {
		if (verifyPassword(password, user.salt, user.password)) {
			return user;
		}
		throw new AuthorizationError("Invalid email or password");
	}

	const {salt, hash: hashedPassword} = hashPassword(password);
	
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

function verifyPassword(
	password: string,
	salt: string,
	storedHash: string
): boolean {
	const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
	return hash === storedHash;
}
