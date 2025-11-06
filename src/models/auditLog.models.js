import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  log_id: { type: String, unique: true, required: true },
  user_firebase_uid: { type: String, ref: 'User' },
  action: { type: String, required: true },
  resource_type: { type: String },
  resource_id: { type: String },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);