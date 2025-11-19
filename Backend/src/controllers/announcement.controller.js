import { createAnnouncementEntry, fetchAnnouncements, removeAnnouncement } from "../services/announcement.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createAnnouncement = asyncHandler(async (req, res) => {
    const { message, expiresAt, priority } = req.body;

    const announcement = await createAnnouncementEntry({
        message,
        expiresAt,
        priority,
        createdBy: req.user?._id,
        createdByName: req.user?.name || req.user?.username || "Admin",
    });

    return res
        .status(201)
        .json(new ApiResponse(201, announcement, "Announcement created successfully"));
});

const getAnnouncements = asyncHandler(async (req, res) => {
    const data = await fetchAnnouncements(req.query);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Announcements fetched successfully"));
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
    const deleted = await removeAnnouncement(req.params.id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, { id: deleted._id }, "Announcement deleted successfully")
        );
});

export { createAnnouncement, getAnnouncements, deleteAnnouncement };
