import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ["uniform", "uneven"],
    },
    date: {
      type: String,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["inprocess", "done", "rejected"],
      default: "inprocess",
    },
    members: {
      type: Array,
      default: [],
    },
    transactionDetails: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TransactionDetail",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const TransactionModel = mongoose.model("Transaction", transactionSchema);
export default TransactionModel;
