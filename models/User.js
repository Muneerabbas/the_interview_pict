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
  },
  {
    timestamps: true,
    collection: "user",
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
