import { ListerVerification, VerificationRecord, GovernmentRecord } from "../models/listerVerification.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generatePendingVerificationId = () =>
  `PV-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

const normalizePan = (value = "") => value.trim().toUpperCase();

const submitVerificationRequest = asyncHandler(async (req, res) => {
  const authUser = req.user;

  if (!authUser) {
    throw new ApiError(401, "User session not found");
  }

  const { name, phoneNumber, aadhaarNumber, panNumber, address } = req.body;

  if (!name || !phoneNumber || !aadhaarNumber || !panNumber) {
    throw new ApiError(400, "Name, phoneNumber, aadhaarNumber and panNumber are required");
  }

  const cleanedPan = normalizePan(panNumber);

  const existingEntry = await ListerVerification.findOne({ user: authUser._id });

  if (existingEntry) {
    if (existingEntry.verificationStatus === "pending") {
      throw new ApiError(400, "Verification already submitted and awaiting review");
    }

    if (existingEntry.verificationStatus === "verified") {
      throw new ApiError(400, "You are already verified as a lister");
    }

    existingEntry.set({
      name,
      email: authUser.email,
      phoneNumber,
      aadhaarNumber,
      panNumber: cleanedPan,
      address,
      verificationStatus: "pending",
      pendingVerificationId: null,
      rejectionReason: null,
      submittedAt: new Date(),
    });

    const updatedEntry = await existingEntry.save();
    await User.findByIdAndUpdate(authUser._id, { verificationStatus: "pending" });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedEntry, "Verification request resubmitted"));
  }

  const submission = await ListerVerification.create({
    user: authUser._id,
    firebaseUid: authUser.firebaseUid,
    name,
    email: authUser.email,
    phoneNumber,
    aadhaarNumber,
    panNumber: cleanedPan,
    address,
    verificationStatus: "pending",
    submittedAt: new Date(),
  });

  await User.findByIdAndUpdate(authUser._id, { verificationStatus: "pending" });

  return res
    .status(201)
    .json(new ApiResponse(201, submission, "Verification request submitted"));
});

const getMyVerificationStatus = asyncHandler(async (req, res) => {
  const submission = await ListerVerification.findOne({ user: req.user._id }).lean();

  if (!submission) {
    throw new ApiError(404, "No verification record found for this account");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, submission, "Verification status retrieved"));
});

const getPendingVerifications = asyncHandler(async (_req, res) => {
  const pending = await ListerVerification.find({ verificationStatus: "pending" })
    .sort({ submittedAt: 1 })
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { count: pending.length, submissions: pending }, "Pending listers fetched")
    );
});

const getVerificationDetails = asyncHandler(async (req, res) => {
  const submission = await ListerVerification.findById(req.params.id)
    .populate("user", "name email role verificationStatus")
    .lean();

  if (!submission) {
    throw new ApiError(404, "Lister verification request not found");
  }

  const lastRecord = await VerificationRecord.findOne({ listerVerification: submission._id })
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, { submission, lastRecord }, "Lister details fetched"));
});

const buildMatchedFields = (submission, record) => {
  const matchedFields = {};

  if (record.name && record.name === submission.name) matchedFields.name = true;
  if (record.aadhaar && record.aadhaar === submission.aadhaarNumber) matchedFields.aadhaarNumber = true;
  if (record.pan && record.pan === submission.panNumber) matchedFields.panNumber = true;
  if (record.phoneNumber && record.phoneNumber === submission.phoneNumber) matchedFields.phoneNumber = true;

  return matchedFields;
};

const verifyListerSubmission = asyncHandler(async (req, res) => {
  const submission = await ListerVerification.findById(req.params.id);

  if (!submission) {
    throw new ApiError(404, "Lister verification request not found");
  }

  if (submission.verificationStatus !== "pending") {
    throw new ApiError(400, "Only pending requests can be verified");
  }

  const governmentRecord = await GovernmentRecord.findOne({
    $or: [{ aadhaar: submission.aadhaarNumber }, { pan: submission.panNumber }],
  }).lean();

  if (!governmentRecord) {
    throw new ApiError(404, "Government record not found for provided Aadhaar/PAN");
  }

  const matchedFields = buildMatchedFields(submission, governmentRecord);

  submission.verificationStatus = "verified";
  submission.pendingVerificationId = null;
  submission.verifiedAt = new Date();
  submission.rejectionReason = null;
  await submission.save();

  await User.findByIdAndUpdate(submission.user, { verificationStatus: "verified" });

  const record = await VerificationRecord.create({
    listerVerification: submission._id,
    adminUser: req.user?._id,
    action: "verified",
    reason: "Government record matched successfully",
    governmentRecordFound: true,
    matchedFields,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submission, verificationRecord: record, matchedFields }, "Lister verified")
    );
});

const rejectListerSubmission = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const submission = await ListerVerification.findById(req.params.id);

  if (!submission) {
    throw new ApiError(404, "Lister verification request not found");
  }

  if (submission.verificationStatus !== "pending") {
    throw new ApiError(400, "Only pending requests can be rejected");
  }

  const pendingVerificationId = generatePendingVerificationId();

  submission.verificationStatus = "rejected";
  submission.pendingVerificationId = pendingVerificationId;
  submission.rejectionReason = reason || "Rejected by admin";
  submission.verifiedAt = null;
  await submission.save();

  await User.findByIdAndUpdate(submission.user, { verificationStatus: "rejected" });

  const record = await VerificationRecord.create({
    listerVerification: submission._id,
    adminUser: req.user?._id,
    action: "rejected",
    reason: submission.rejectionReason,
    pendingVerificationId,
    governmentRecordFound: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { submission, verificationRecord: record }, "Lister verification rejected")
    );
});

const listAllVerificationRequests = asyncHandler(async (_req, res) => {
  const submissions = await ListerVerification.find()
    .populate("user", "name email role verificationStatus")
    .sort({ createdAt: -1 })
    .lean();

  const stats = {
    total: submissions.length,
    verified: submissions.filter((item) => item.verificationStatus === "verified").length,
    pending: submissions.filter((item) => item.verificationStatus === "pending").length,
    rejected: submissions.filter((item) => item.verificationStatus === "rejected").length,
  };

  return res.status(200).json(new ApiResponse(200, { stats, submissions }, "Lister overview"));
});

const listVerificationRecords = asyncHandler(async (_req, res) => {
  const records = await VerificationRecord.find()
    .populate("listerVerification")
    .populate("adminUser", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, { count: records.length, records }, "Verification history"));
});

export {
  submitVerificationRequest,
  getMyVerificationStatus,
  getPendingVerifications,
  getVerificationDetails,
  verifyListerSubmission,
  rejectListerSubmission,
  listAllVerificationRequests,
  listVerificationRecords,
};
