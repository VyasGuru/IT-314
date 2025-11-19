import {
    createListerNotification,
    listUserNotifications,
    listAdminNotifications,
    markNotificationAsRead,
    countUnreadNotifications,
} from "../services/notification.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const validateString = (value, name, { min = 1, max = 2000 } = {}) => {
    if (typeof value !== "string") {
        throw new ApiError(400, `${name} must be a string`);
    }

    const trimmed = value.trim();

    if (trimmed.length < min) {
        throw new ApiError(400, `${name} is required`);
    }

    if (trimmed.length > max) {
        throw new ApiError(400, `${name} is too long`);
    }

    return trimmed;
};

const notifyLister = asyncHandler(async (req, res) => {
    const { toUser, title, message, notificationType, metadata } = req.body;

    if (!toUser) {
        throw new ApiError(400, "toUser is required");
    }

    const normalizedTitle = validateString(title, "Title", { max: 200 });
    const normalizedMessage = validateString(message, "Message", { max: 2000 });

    const notification = await createListerNotification({
        toUser,
        title: normalizedTitle,
        message: normalizedMessage,
        type: notificationType,
        metadata: {
            ...(metadata || {}),
            sentBy: req.user?._id,
            sentByName: req.user?.name,
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, notification, "Notification sent to lister"));
});

const getUserNotifications = asyncHandler(async (req, res) => {
    const targetUserId = req.params.userId || req.user?._id?.toString();

    if (!targetUserId) {
        throw new ApiError(401, "Not authenticated");
    }

    const isAdmin = req.user?.role === "admin";

    if (req.params.userId && !isAdmin && targetUserId !== req.user?._id?.toString()) {
        throw new ApiError(403, "Access denied");
    }

    const [notifications, unreadCount] = await Promise.all([
        listUserNotifications({ userId: targetUserId, filters: req.query }),
        countUnreadNotifications({ userId: targetUserId }),
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, { notifications, unreadCount }, "Notifications fetched successfully")
        );
});

const getAdminNotifications = asyncHandler(async (req, res) => {
    const [notifications, unreadCount] = await Promise.all([
        listAdminNotifications(req.query),
        countUnreadNotifications({ isAdmin: true }),
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, { notifications, unreadCount }, "Admin notifications fetched")
        );
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await markNotificationAsRead(req.params.id, {
        isAdmin: req.user?.role === "admin",
        userId: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, notification, "Notification marked as read"));
});

export { notifyLister, getUserNotifications, getAdminNotifications, markAsRead };
