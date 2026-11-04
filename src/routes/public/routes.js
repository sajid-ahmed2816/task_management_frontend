import { createElement } from "react";
import Login from "../../views/auth";

const publicRoutes = [
	{
		path: "/login",
		component: createElement(Login),
		title: "Sign in",
		description: "Sign in to manage your workspaces, projects, tasks, and team conversations.",
	}
];

export default publicRoutes;
