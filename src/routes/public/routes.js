import {createElement} from "react";
import Login from "../../views/Login";

const publicRoutes = [
	{
		path:"/login",
		component: createElement(Login)
	}
];

export default publicRoutes;