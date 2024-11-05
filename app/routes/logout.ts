import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { auth } from "~/lib/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	await auth.logout(request, { redirectTo: "/login" });
};

export const loader = async () => redirect("/login");
