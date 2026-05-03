import {
  DashboardOutlined,
  EventNoteRounded,
  FormatListBulletedRounded,
  ModeCommentOutlined,
  SettingsOutlined,
  WorkHistoryOutlined
} from "@mui/icons-material";

const menu = [
  {
    label: "Dashboard",
    icon: <DashboardOutlined />,
    path: "/dashboard"
  },
  {
    label: "Chat",
    icon: <ModeCommentOutlined />,
    path: "/chat"
  },
  {
    label: "Calendar",
    icon: <EventNoteRounded />,
    path: "/calendar"
  },
  {
    label: "Tasks",
    icon: <FormatListBulletedRounded />,
    path: "/tasks",
  },
  {
    label: "Projects",
    icon: <WorkHistoryOutlined />,
    path: "/projects"
  },
  {
    label: "Setting",
    icon: <SettingsOutlined />,
    path: "/setting"
  }
];

export default menu;