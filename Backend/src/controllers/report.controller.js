import { getDailySummary, resetDailyStats } from "../services/stats.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getDailyReport = asyncHandler(async (req, res) => {
    const summary = await getDailySummary();

    return res
        .status(200)
        .json(new ApiResponse(200, summary, `Daily summary requested by ${req.user?.name || "Admin"}`));
});

const resetDailyReport = asyncHandler(async (req, res) => {
    const result = await resetDailyStats();

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, `${req.user?.name || "Admin"} reset the daily statistics`)
        );
});

export { getDailyReport, resetDailyReport };
