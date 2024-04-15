import mongoose from "mongoose";

const transactionDetailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    moneyDetail: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
      enum: ["inprocess", "done"],
    },
    name: {
      type: String,
      required: true,
    },
    debitAmount: {
      type: Number,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TransactionDetailModel = mongoose.model(
  "TransactionDetail",
  transactionDetailSchema
);
export default TransactionDetailModel;
