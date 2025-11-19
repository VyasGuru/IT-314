import mongoose from "mongoose";
import { Notification } from "../models/notification.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

const NOTIFICATION_TYPES = ["system", "listing_update", "message", "verification"];

const normalizeNotificationType = (value, fallback = "message") => {
    if (!value) {
        return fallback;
    }

    const normalized = value.toString().trim();

    if (NOTIFICATION_TYPES.includes(normalized)) {
        return normalized;
    }

    return fallback;
};

const resolveUserObjectId = async (identifier) => {
    if (!identifier) {
        return null;
    }

    if (identifier instanceof mongoose.Types.ObjectId) {
        return identifier;
    }

    if (typeof identifier === "object" && identifier?._id) {
        return new mongoose.Types.ObjectId(identifier._id);
    }

    if (typeof identifier === "string") {
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            const user = await User.findById(identifier).select("_id");
            if (user) {
                return user._id;
            }
        }

        const user = await User.findOne({ firebaseUid: identifier }).select("_id");
        if (user) {
            return user._id;
        }
    }

    return null;
};

const sanitizeLimit = (value) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return 20;
    }
    return Math.min(parsed, 100);
};

const buildUserNotificationQuery = async ({ userId, filters = {} }) => {
    const objectId = await resolveUserObjectId(userId);
    if (!objectId) {
        throw new ApiError(404, "User not found");
    }

    const query = { userFirebaseUid: objectId };

    if (filters.type && NOTIFICATION_TYPES.includes(filters.type)) {
        query.notificationType = filters.type;
    }

    if (filters.unreadOnly === "true") {
        query.isRead = false;
    }

    return { query, objectId };
};

const createListerNotification = async ({ toUser, title, message, type, metadata }) => {
    const objectId = await resolveUserObjectId(toUser);

    if (!objectId) {
        throw new ApiError(404, "Recipient not found");
    }

    const payload = {
        userFirebaseUid: objectId,
        title: title.trim(),
        message: message.trim(),
        notificationType: normalizeNotificationType(type, "message"),
        metadata: metadata || {},
    };

    const notification = await Notification.create(payload);

    return notification;
};

const createAdminNotification = async ({ title, message, type, metadata }) => {
    const payload = {
        userFirebaseUid: null,
        title: title.trim(),
        message: message.trim(),
        notificationType: normalizeNotificationType(type, "system"),
        metadata: metadata || {},
    };

    return Notification.create(payload);
};

const listUserNotifications = async ({ userId, filters = {} }) => {
    const { query } = await buildUserNotificationQuery({ userId, filters });
    const limit = sanitizeLimit(filters.limit);

    return Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
};

const listAdminNotifications = async (filters = {}) => {
    const query = { userFirebaseUid: null };

    if (filters.type && NOTIFICATION_TYPES.includes(filters.type)) {
        query.notificationType = filters.type;
    }

    if (filters.unreadOnly === "true") {
        query.isRead = false;
    }

    const limit = sanitizeLimit(filters.limit);

    return Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
};

const markNotificationAsRead = async (notificationId, { isAdmin = false, userId } = {}) => {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid notification id");
    }

    const filter = { _id: notificationId };

    if (isAdmin) {
        filter.userFirebaseUid = null;
    } else {
        const objectId = await resolveUserObjectId(userId);
        if (!objectId) {
            throw new ApiError(401, "Not authorized to update this notification");
        }
        filter.userFirebaseUid = objectId;
    }

    const notification = await Notification.findOneAndUpdate(filter, { isRead: true }, { new: true }).lean();

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return notification;
};

const countUnreadNotifications = async ({ userId, isAdmin = false } = {}) => {
    const filter = { isRead: false };

    if (isAdmin) {
        filter.userFirebaseUid = null;
    } else {
        const objectId = await resolveUserObjectId(userId);
        if (!objectId) {
            return 0;
        }
        filter.userFirebaseUid = objectId;
    }

    return Notification.countDocuments(filter);
};

export {
    createListerNotification,
    createAdminNotification,
    listUserNotifications,
    listAdminNotifications,
    markNotificationAsRead,
    countUnreadNotifications,
    NOTIFICATION_TYPES,
};
