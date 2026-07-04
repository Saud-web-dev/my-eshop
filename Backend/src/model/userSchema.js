import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {  // Changed from fullName to name to match controller
      type: String,
      trim: true,
      required: true, // Made required
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true, // Made required since we're hashing it
    },

    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;