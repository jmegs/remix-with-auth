import type {
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { auth } from "~/lib/auth.server";

export const meta: MetaFunction = () => {
	return [
		{ title: "remix-with-auth" },
		{ name: "description", content: "remix, remix-auth, prisma" },
	];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await auth.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	return { email: user.email };
};

export default function Index() {
	const { email } = useLoaderData<typeof loader>();
	return (
		<div className="">
			<h1>welcome to remix</h1>
			<p>{email}</p>
			<Form method="post" action="/logout">
				<button type="submit" className="underline">Logout</button>
			</Form>
		</div>
	);
}
