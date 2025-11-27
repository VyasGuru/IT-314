import { Property } from "../models/property.models.js";
import { Listing } from "../models/listing.models.js";
import { Review } from "../models/review.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createListerNotification } from "../services/notification.service.js";
import mongoose from "mongoose";

const REASON_LABELS = {
  incorrect: "Incorrect or incomplete listing information",
  not_available: "Property no longer available",
  violation: "Violation of platform rules",
};

// Admin deletes one or more listings and notifies each lister with  reasons
const deleteListings = asyncHandler(async (req, res) => {
  const { propertyIds, reasons = [], otherReason } = req.body;

  // Accept a single id as well
  const ids = Array.isArray(propertyIds) ? propertyIds : [propertyIds];
  if (!ids || ids.length === 0) {
    throw new ApiError(400, "propertyIds is required (array or single id)");
  }

  const results = [];

  for (const pid of ids) {
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      results.push({ propertyId: pid, ok: false, reason: "invalid_property_id" });
      continue;
    }

    const property = await Property.findById(pid);
    if (!property) {
      results.push({ propertyId: pid, ok: false, reason: "property_not_found" });
      continue;
    }

    const listing = await Listing.findOne({ propertyId: property._id });
    if (!listing) {
      results.push({ propertyId: pid, ok: false, reason: "listing_not_found" });
      continue;
    }

    // Build notification message
    const chosenReasons = (Array.isArray(reasons) ? reasons : []).map((r) => REASON_LABELS[r] || r);
    const reasonsText = chosenReasons.length > 0 ? chosenReasons.map((r) => `- ${r}`).join("\n") : "- No reason provided";
    const otherText = otherReason ? `\nOther: ${otherReason}` : "";

    const message = `Your listing \"${property.title}\" has been removed for the following reason(s):\n${reasonsText}${otherText}\n\nIf you have any further queries, please contact the Admin.`;

    try {
      // Delete  reviews
      const propertyIdString = property._id.toString();
      await Review.deleteMany({ target_id: propertyIdString, target_type: "property" });

      // Delete the database records
      await Property.findByIdAndDelete(property._id);
      await Listing.findByIdAndDelete(listing._id);

      // Send notification to the lister
      await createListerNotification({
        toUser: listing.listerFirebaseUid,
        title: "Listing removed",
        message,
        type: "admin_notification",
        metadata: {
          propertyId: property._id,
        },
      });

      results.push({ propertyId: pid, ok: true });
    } catch (err) {
      results.push({ propertyId: pid, ok: false, reason: err.message });
    }
  }

  return res.status(200).json(new ApiResponse(200, { results }, "Delete operations completed"));
});

export { deleteListings };
