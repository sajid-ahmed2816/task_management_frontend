import { createElement } from "react";
import Home from "../../views/home";
import Chat from "../../views/chat";
import Calendar from "../../views/calendar";
import Tasks from "../../views/tasks";
import Projects from "../../views/projects";
import Setting from "../../views/settings";
import Notifications from "../../views/notifications";

const adminRoutes = [
  {
    path: "/dashboard",
    component: createElement(Home),
    title: "Dashboard",
    description: "See workspace activity, active projects, task progress, upcoming deadlines, and recent conversations.",
  },
  {
    path: "/chats",
    component: createElement(Chat),
    title: "Workspace chat",
    description: "Chat with active members of your current workspace and browse shared links.",
  },
  {
    path: "/calendar",
    component: createElement(Calendar),
    title: "Calendar",
    description: "View workspace tasks and deadlines on the calendar.",
  },
  {
    path: "/tasks",
    component: createElement(Tasks),
    title: "Tasks",
    description: "View, organize, assign, and update tasks for your workspace.",
  },
  {
    path: "/projects",
    component: createElement(Projects),
    title: "Projects",
    description: "Manage workspace projects, timelines, priorities, and status.",
  },
  {
    path: "/settings",
    component: createElement(Setting),
    title: "Settings",
    description: "Manage your profile, workspace, and workspace members.",
  },
  {
    path: "/notifications",
    component: createElement(Notifications),
    title: "Notifications",
    description: "Review task assignments, messages, and other workspace updates.",
  },
];

export default adminRoutes;
