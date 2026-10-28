const notificationRoutes = {
  list: "/notifications",
  unreadCount: "/notifications/unread-count",
  markRead: (id) => `/notifications/${id}/read`,
  markAllRead: "/notifications/read-all",
};

export default notificationRoutes;
