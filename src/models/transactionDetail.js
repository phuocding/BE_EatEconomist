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
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    name: {
      type: String,
      require: true,
    },
    amount: {
      type: Number,
      require: true,
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
