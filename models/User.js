import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    gmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePic_Url: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    profile_pic: {
      type: String,
      required: false,
      trim: true,
    },
    notificationState: {
      lastCheckedAt: {
        type: Date,
        default: null,
      },
      postLikesSeen: {
        type: Map,
        of: Number,
        default: {},
      },
      commentLikesSeen: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    headline: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    about: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    college: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    branch: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    batch: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    currentCompany: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      leetcode: { type: String, default: "" },
      codeforces: { type: String, default: "" },
      codechef: { type: String, default: "" },
      youtube: { type: String, default: "" },
      instagram: { type: String, default: "" },
      custom: [
        {
          name: { type: String, default: "" },
          url: { type: String, default: "" },
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: "user",
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
