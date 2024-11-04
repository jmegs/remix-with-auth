import { createCookieSessionStorage } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [process.env.COOKIE_SECRET ?? "s3cret"],
		secure: process.env.NODE_ENV === "production",
	},
});

export const { getSession, commitSession, destroySession } = sessionStorage;
