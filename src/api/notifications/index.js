import { get, patch } from "../index";
import notificationRoutes from "./routes";

const NotificationServices = {
  getNotifications: async (params) => get(notificationRoutes.list, params),
  getUnreadCount: async () => get(notificationRoutes.unreadCount),
  markRead: async (id) => patch(notificationRoutes.markRead(id), {}),
  markAllRead: async () => patch(notificationRoutes.markAllRead, {}),
};

export default NotificationServices;
