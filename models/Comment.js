import mongoose from "mongoose";

export const MAX_COMMENT_NESTING_LEVEL = 3;
export const MAX_COMMENT_DEPTH = MAX_COMMENT_NESTING_LEVEL - 1;

const commentSchema = new mongoose.Schema(
  {
    experience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    rootComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    depth: {
      type: Number,
      min: 0,
      max: MAX_COMMENT_DEPTH,
      default: 0,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["doubt", "tip", "experience", "general"],
      default: "general",
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.pre("validate", function normalizeTreeFields(next) {
  if (this.parentComment) {
    if (!this.rootComment) this.rootComment = this.parentComment;
    if (typeof this.depth !== "number" || this.depth < 1) this.depth = 1;
  } else {
    this.rootComment = null;
    this.depth = 0;
  }
  next();
});

commentSchema.index({ experience: 1, parentComment: 1, createdAt: -1 });
commentSchema.index({ experience: 1, rootComment: 1, depth: 1, createdAt: 1 });

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
