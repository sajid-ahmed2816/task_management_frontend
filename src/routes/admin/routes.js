import { createElement } from "react";
import Home from "../../views/home";
import Chat from "../../views/chat";
import Calendar from "../../views/calendar";
import Tasks from "../../views/tasks";
import Projects from "../../views/projects";
import Setting from "../../views/setting";

const adminRoutes = [
  {
    path: "/dashboard",
    component: createElement(Home)
  },
  {
    path: "/chat",
    component: createElement(Chat)
  },
  {
    path: "/calendar",
    component: createElement(Calendar)
  },
  {
    path: "/tasks",
    component: createElement(Tasks),
  },
  {
    path: "/projects",
    component: createElement(Projects),
  },
  {
    path: "/setting",
    component: createElement(Setting),
  },
];

export default adminRoutes;