import { GovernmentRecord } from "../models/listerVerification.models.js";
import { DEFAULT_GOVERNMENT_RECORDS } from "../constants/governmentRecords.js";

let recordsSeeded = false;

const seedGovernmentRecords = async () => {
  if (recordsSeeded) return;

  const existingCount = await GovernmentRecord.countDocuments();
  if (existingCount === 0) {
    await GovernmentRecord.insertMany(DEFAULT_GOVERNMENT_RECORDS);
    console.log("Seeded default government records");
  }

  recordsSeeded = true;
};

export { seedGovernmentRecords };
