import mongoose from "mongoose";
import { Announcement, ANNOUNCEMENT_PRIORITIES } from "../models/announcement.models.js";
import { ApiError } from "../utils/ApiError.js";

const PRIORITY_WEIGHT = {
    urgent: 3,
    high: 2,
    normal: 1,
};

const sanitizePriority = (priority = "normal") => {
    if (!priority) {
        return "normal";
    }

    const normalized = priority.toLowerCase().trim();

    if (!ANNOUNCEMENT_PRIORITIES.includes(normalized)) {
        throw new ApiError(400, "Invalid priority. Use: normal, high, or urgent");
    }

    return normalized;
};

const parseExpiresAt = (expiresAt) => {
    if (!expiresAt) {
        return null;
    }

    const parsed = new Date(expiresAt);

    if (Number.isNaN(parsed.getTime())) {
        throw new ApiError(400, "Invalid expiresAt value");
    }

    return parsed;
};

const activeFilter = () => ({
    $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
    ],
});

const createAnnouncementEntry = async ({
    message,
    expiresAt,
    priority,
    createdBy,
    createdByName,
}) => {
    if (!message || !message.trim()) {
        throw new ApiError(400, "Message is required");
    }

    const announcement = await Announcement.create({
        message: message.trim(),
        priority: sanitizePriority(priority),
        expiresAt: parseExpiresAt(expiresAt),
        createdBy,
        createdByName,
    });

    return announcement;
};

const fetchAnnouncements = async ({ priority, sortBy, page = 1, limit = 10 }) => {
    const filter = activeFilter();

    if (priority) {
        filter.priority = sanitizePriority(priority);
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(Number(limit) || 10, 50));
    const skip = (pageNumber - 1) * pageSize;

    const pipeline = [{ $match: filter }];

    if (sortBy === "priority") {
        pipeline.push({
            $addFields: {
                priorityWeight: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$priority", "urgent"] }, then: PRIORITY_WEIGHT.urgent },
                            { case: { $eq: ["$priority", "high"] }, then: PRIORITY_WEIGHT.high },
                        ],
                        default: PRIORITY_WEIGHT.normal,
                    },
                },
            },
        });
        pipeline.push({ $sort: { priorityWeight: -1, createdAt: -1 } });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({ $skip: skip }, { $limit: pageSize });

    if (sortBy === "priority") {
        pipeline.push({ $project: { priorityWeight: 0 } });
    }

    const [announcements, total] = await Promise.all([
        Announcement.aggregate(pipeline),
        Announcement.countDocuments(filter),
    ]);

    return {
        announcements,
        pagination: {
            page: pageNumber,
            limit: pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    };
};

const removeAnnouncement = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid announcement id");
    }

    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) {
        throw new ApiError(404, "Announcement not found");
    }

    return deleted;
};

const findAnnouncementById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid announcement id");
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
        throw new ApiError(404, "Announcement not found");
    }

    return announcement;
};

export {
    createAnnouncementEntry,
    fetchAnnouncements,
    removeAnnouncement,
    findAnnouncementById,
};
