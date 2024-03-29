import mongoose from "mongoose";

const jobAdvertisementSchema = new mongoose.Schema({
  // jobId: { type: String },
  quota: { type: Number },
  company: { type: String },
  location: { type: String },
  positionName: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  jobDescription: { type: String },
  qualifications: { type: String },
  applicationDeadline: { type: Date },
  status: { type: Boolean, default: true },
  postedAt: { type: Date, default: Date.now },
  acceptedApplicationsCount: { type: Number, default: 0 },
  workType: { type: String, enum: ["Hybrid", "Remote", "Office"] },
  employmentType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
  },
  applicants: [{ type: String }],
});

jobAdvertisementSchema.pre("save", async function (next) {
  try {
    next();
  } catch (error) {
    next(error);
  }
});

const jobAdvertisementModel = mongoose.model(
  "JobAdvertisement",
  jobAdvertisementSchema,
);

export default jobAdvertisementModel;
