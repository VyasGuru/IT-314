import { DailyStats } from "../models/dailyStats.models.js";
import { ApiError } from "../utils/ApiError.js";

const MAX_RECENT_UPLOADS = 5;

const getDateKey = (date = new Date()) => date.toISOString().split("T")[0];

const ensureTodayDoc = async () => {
    const dateKey = getDateKey();

    const doc = await DailyStats.findOneAndUpdate(
        { dateKey },
        {
            $setOnInsert: {
                newProperties: 0,
                approved: 0,
                pending: 0,
                rejected: 0,
                totalUploads: 0,
                lastReset: new Date(),
                recentUploads: [],
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return doc;
};

const updateRecentUploads = (record) => ({
    $push: {
        recentUploads: {
            $each: [record],
            $position: 0,
            $slice: MAX_RECENT_UPLOADS,
        },
    },
});

const recordPropertyUpload = async ({ propertyId, listerId, listerName, title }) => {
    if (!propertyId || !listerId) {
        throw new ApiError(500, "Property uploads require propertyId and listerId");
    }

    const record = {
        propertyId,
        listerId,
        listerName,
        title,
        status: "pending",
        uploadedAt: new Date(),
    };

    await DailyStats.findOneAndUpdate(
        { dateKey: getDateKey() },
        {
            $inc: {
                newProperties: 1,
                pending: 1,
                totalUploads: 1,
            },
            $set: { lastReset: new Date() },
            ...updateRecentUploads(record),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

const recordStatusChange = async ({ propertyId, oldStatus, newStatus }) => {
    const normalized = newStatus === "approved" ? "approved" : newStatus;
    const updates = { $set: { lastReset: new Date() } };
    updates.$inc = {};

    if (oldStatus === "pending" && normalized !== "pending") {
        updates.$inc.pending = -1;
    }

    if (normalized === "approved") {
        updates.$inc.approved = 1;
    } else if (normalized === "rejected") {
        updates.$inc.rejected = 1;
    } else if (normalized === "pending") {
        updates.$inc.pending = (updates.$inc.pending || 0) + 1;
    }

    if (Object.keys(updates.$inc).length === 0) {
        delete updates.$inc;
    }

    const arrayFilters = propertyId
        ? [{ "elem.propertyId": propertyId }]
        : undefined;

    if (propertyId) {
        updates.$set = {
            ...(updates.$set || {}),
            "recentUploads.$[elem].status": normalized,
        };
    }

    const options = {
        upsert: true,
        setDefaultsOnInsert: true,
    };

    if (arrayFilters) {
        options.arrayFilters = arrayFilters;
    }

    await DailyStats.findOneAndUpdate(
        { dateKey: getDateKey() },
        updates,
        options
    );
};

const getDailySummary = async () => {
    const dateKey = getDateKey();
    let stats = await DailyStats.findOne({ dateKey }).lean();

    if (!stats) {
        stats = (await ensureTodayDoc()).toObject();
    }

    const approvalRate = stats.totalUploads > 0
        ? `${((stats.approved / stats.totalUploads) * 100).toFixed(2)}%`
        : "N/A";

    return {
        date: dateKey,
        generatedAt: new Date().toISOString(),
        statistics: {
            newProperties: stats.newProperties,
            approved: stats.approved,
            pending: stats.pending,
            rejected: stats.rejected,
            totalUploads: stats.totalUploads,
            lastReset: stats.lastReset,
        },
        approvalRate,
        recentUploads: stats.recentUploads || [],
    };
};

const resetDailyStats = async () => {
    const dateKey = getDateKey();
    const existing = await DailyStats.findOne({ dateKey }).lean();

    const updated = await DailyStats.findOneAndUpdate(
        { dateKey },
        {
            newProperties: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            totalUploads: 0,
            lastReset: new Date(),
            recentUploads: [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return {
        oldStats: existing || {
            newProperties: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            totalUploads: 0,
            lastReset: new Date(),
            recentUploads: [],
        },
        newStats: updated,
    };
};

export {
    recordPropertyUpload,
    recordStatusChange,
    getDailySummary,
    resetDailyStats,
};
