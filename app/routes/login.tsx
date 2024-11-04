import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { auth } from "~/lib/auth.server";
import { getSession } from "~/lib/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	await auth.authenticate("form", request, {
		successRedirect: "/",
		failureRedirect: "/login",
	});
};

type LoaderError = { message: string } | null;
export const loader = async ({ request }: LoaderFunctionArgs) => {
	await auth.isAuthenticated(request, { successRedirect: "/" });

	const session = await getSession(request.headers.get("Cookie"));
	const error = session.get(auth.sessionErrorKey) as LoaderError;
	
	return { error };
};

export default function LoginPage() {
	const { error } = useLoaderData<typeof loader>();
	return (
		<Form method="post" className="max-w-64 flex flex-col gap-4">
			{error ? <div className="text-red-500">{error.message}</div> : null}

			<div className="flex flex-col">
				<label htmlFor="email">Email</label>
				<input
					type="email"
					name="email"
					id="email"
				/>
			</div>

			<div className="flex flex-col">
				<label htmlFor="password">Password</label>
				<input
					type="password"
					name="password"
					id="password"
				/>
			</div>

			<button type="submit" className="btn">
				Log In
			</button>
		</Form>
	);
}
