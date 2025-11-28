import api from "./api";

/**
 * Notification API service
 * Handles fetching and updating notifications for end users
 */
export const getUserNotifications = async (params = {}) => {
  const response = await api.get("/notifications/me", { params });
  return response.data;
};

export const markUserNotificationAsRead = async (notificationId) => {
  if (!notificationId) {
    throw new Error("notificationId is required");
  }

  const response = await api.patch(`/notifications/me/${notificationId}/read`);
  return response.data;
};
