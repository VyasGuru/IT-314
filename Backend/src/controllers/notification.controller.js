import {
    createListerNotification,
    createAdminNotification,
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

const normalizeResolutionMessages = (messages) => {
    if (!Array.isArray(messages)) {
        return [];
    }

    return messages
        .filter((message) => typeof message === "string")
        .map((message) => message.trim())
        .filter((message) => message.length > 0)
        .slice(0, 10); // prevent accidental spam
};

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await markNotificationAsRead(req.params.id, {
        isAdmin: req.user?.role === "admin",
        userId: req.user?._id,
    });

    if (
        req.user?.role === "admin" &&
        !notification?.userFirebaseUid &&
        notification?.metadata?.sentBy
    ) {
        try {
            const title = notification.title || "Your query was updated";
            const resolutionMessages = normalizeResolutionMessages(req.body?.resolutionMessages);
            const fallbackMessage = `Your query "${title}" has been marked as resolved by the admin team.`;
            const message = resolutionMessages.length > 0 ? resolutionMessages.join("\n\n") : fallbackMessage;

            await createListerNotification({
                toUser: notification.metadata.sentBy,
                title,
                message,
                type: "system",
                metadata: {
                    sourceNotificationId: notification._id,
                    resolvedBy: req.user?._id,
                    resolvedByName: req.user?.name,
                    resolutionMessages,
                },
            });
        } catch (error) {
            console.error("Failed to notify user about resolved issue", error);
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, notification, "Notification marked as read"));
});

const sendToAdmin = asyncHandler(async (req, res) => {
    const { title, message, contactEmail, contactName } = req.body || {};

    const normalizedTitle = validateString(title || "User query", "Title", { max: 200 });
    const normalizedMessage = validateString(message, "Message", { max: 2000 });

    let resolvedEmail = req.user?.email;
    if (!resolvedEmail && typeof contactEmail === "string") {
        resolvedEmail = contactEmail.trim();
    }

    let resolvedName =
        req.user?.name ||
        req.user?.email ||
        (typeof contactName === "string" ? contactName.trim() : "");

    if (!resolvedName) {
        resolvedName = resolvedEmail || "Anonymous user";
    }

    if (!resolvedEmail) {
        throw new ApiError(400, "Please provide a contact email so the admin can respond");
    }

    const notification = await createAdminNotification({
        title: normalizedTitle,
        message: normalizedMessage,
        type: "message",
        metadata: {
            sentBy: req.user?._id ?? null,
            sentByName: resolvedName,
            sentByEmail: resolvedEmail,
            isAnonymous: !req.user,
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, notification, "Message sent to admin"));
});

export { notifyLister, getUserNotifications, getAdminNotifications, markAsRead, sendToAdmin };
