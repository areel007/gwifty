import { Schema, model } from "mongoose";

const trade = new Schema({
  username: {
    type: String,
  },
  type: {
    type: String,
    enum: ["AMAZON", "STEAM", "APPLE", "GOOGLE_PAY", "NETFLIX"],
  },
  amount: {
    type: Number,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "CANCELLED"],
    default: "PENDING",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Trade", trade);
