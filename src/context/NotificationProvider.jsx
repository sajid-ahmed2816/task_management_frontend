import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import NotificationServices from "../api/notifications";
import { apiBaseUrl } from "../config/axios/axios";
import useAuth from "../hooks/useAuth";
import { NotificationContext } from "./NotificationContext";

const socketUrl = apiBaseUrl.replace(/\/api\/?$/, "");

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const token = user?.token;
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const result = await NotificationServices.getUnreadCount();
      if (result?.status) setUnreadCount(Number(result?.data?.unreadCount) || 0);
    } catch {
      // Keep the last known count; the inbox has its own loading/error state.
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return undefined;
    };

    let active = true;

    NotificationServices.getUnreadCount().then((result) => {
      if (active && result?.status) {
        setUnreadCount(Number(result?.data?.unreadCount) || 0);
      };
    }).catch(() => { });

    const socket = io(socketUrl, { auth: { token } });
    socket.on("notification:new", () => {
      if (active) setUnreadCount((count) => count + 1);
    });
    socket.on("notification:unread-count", (payload) => {
      if (active && Number.isFinite(Number(payload?.unreadCount))) {
        setUnreadCount(Math.max(0, Number(payload.unreadCount)));
      }
    });
    return () => {
      active = false;
      socket.disconnect();
    };
  }, [token]);

  const value = useMemo(() => ({
    unreadCount,
    setUnreadCount,
    refreshUnreadCount
  }), [unreadCount, refreshUnreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = { children: PropTypes.node };

