import mongoose from "mongoose";

const transactionDetailSchema = new mongoose.Schema({
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
});

const TransactionDetailModel = mongoose.model(
  "TransactionDetail".transatransactionDetailSchemactionSchema
);
export default TransactionDetailModel;
