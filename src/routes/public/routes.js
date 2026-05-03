import { createElement } from "react";
import Login from "../../views/auth";

const publicRoutes = [
	{
		path: "/login",
		component: createElement(Login)
	}
];

export default publicRoutes;