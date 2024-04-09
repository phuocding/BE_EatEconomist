import asyncHandler from "express-async-handler";
import TransactionModel from "../models/transaction.js";
import TransactionDetailModel from "../models/transactionDetail.js";
import { ObjectId } from "mongodb";

const caculateDebitAmount = (transaction, transactionDetails) => {
  let updateTransactionDetails;
  if (transaction.type == "uneven") {
    const discountPercent = transaction.discount / transaction.amount;
    updateTransactionDetails = transactionDetails.map((detail) => ({
      ...detail,
      debitAmount: detail.moneyDetail * (1 - discountPercent),
    }));
  } else if (transaction.type == "uniform") {
    const debitAmount = transaction.amount / transactionDetails.length;
    updateTransactionDetails = transactionDetails.map((detail) => ({
      ...detail,
      debitAmount,
    }));
  }

  return updateTransactionDetails;
};

const createTransaction = asyncHandler(async (req, res) => {
  const {
    amount,
    discount,
    type,
    date,
    description,
    status,
    transactionDetail = [],
  } = req.body;

  const insertedTransactionDetail = await TransactionDetailModel.insertMany(
    transactionDetail
  );

  if (!insertedTransactionDetail) {
    res.status(400);
    throw new Error("Create transactiondetail failed");
  }

  const members = await insertedTransactionDetail.map((item) => item.user);
  const transactionDetails = await insertedTransactionDetail.map(
    (item) => item._id
  );
  console.log(
    "🚀 ~ createTransaction ~ transactionDetails:",
    transactionDetails
  );

  const owner = req.user.id;
  const newTransaction = new TransactionModel({
    owner,
    amount,
    discount,
    type,
    date,
    status,
    description,
    members,
    transactionDetails,
  });

  const savedTransaction = await newTransaction.save();

  res.status(201).json({
    message: "Transaction created successfully",
    savedTransaction,
    insertedTransactionDetail,
  });
});

const updateTransactionDetail = asyncHandler(async (req, res) => {
  const transactionDetailId = req.query.id;
  const { id: userId, role: userRole } = req.user; // Destructuring để làm code gọn gàng hơn

  const transaction = await TransactionModel.find({
    transactionDetails: { $in: [transactionDetailId] },
  });
  const transactionDetail = await TransactionDetailModel.findById(
    transactionDetailId
  );

  if (!transactionDetail) {
    res.status(404);
    throw new Error("TransactionDetail not found");
  }
  if (
    userId === transaction[0]?.owner.toString() ||
    userRole === "admin" ||
    userId === transactionDetail.user.toString()
  ) {
    // Giả định `userId` là thuộc tính đúng của model
    const updatedTransactionDetail =
      await TransactionDetailModel.findByIdAndUpdate(
        transactionDetailId,
        req.body,
        { new: true }
      );
    return res.status(200).json({
      message: "Transaction detail updated successfully",
      transactionDetail: updatedTransactionDetail, // Trả về chi tiết đã cập nhật
    });
  } else {
    return res
      .status(403)
      .json({ message: "Not authorized to update this transaction detail" });
  }
});
const updateTransaction = asyncHandler(async (req, res) => {
  const transactionId = req.query.id;
  const { id: userId, role: userRole } = req.user; // Destructuring để làm code gọn gàng hơn
  const transaction = await TransactionModel.findById(transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  if (userId === transaction.owner.toString() || userRole === "admin") {
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      transactionId,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction, // Trả về chi tiết đã cập nhật
    });
  } else {
    return res
      .status(403)
      .json({ message: "Not authorized to update this transaction" });
  }
});
const getTransactionById = asyncHandler(async (req, res) => {
  const transactionId = req.query.id;
  const transaction = await TransactionModel.findById(transactionId)
    .populate("owner transactionDetails", { password: 0 })
    .populate({
      path: "transactionDetails",
      populate: {
        path: "user",
      },
    })
    .lean();

  if (!transaction) {
    res.status(403);
    throw new Error("Transaction not found");
  }
  transaction.transactionDetailAffterMap = await caculateDebitAmount(
    transaction,
    transaction.transactionDetails
  );

  return res.status(200).json({
    message: "Transaction by Id found",
    transaction,
  });
});
const getTransaction = asyncHandler(async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;
  const sort = req.query.sort || "desc";
  const skip = (page - 1) * limit;
  const sortValues = sort === "desc" ? -1 : 1;

  const transaction = await TransactionModel.find()
    .sort({ date: sortValues })
    .skip(skip)
    .limit(limit)
    .lean();
  const totalTransaction = await TransactionModel.countDocuments();

  const transactionWithDetails = await Promise.all(
    transaction.map(async (tran) => {
      const detail = await TransactionDetailModel.find({
        transactionId: tran._id,
      })
        .populate("user", { password: 0 })
        .lean();
      tran.detail = caculateDebitAmount(tran, detail);

      return tran;
    })
  );

  return res.status(200).json({
    message: "Transaction found",
    transaction: transactionWithDetails,
    pagination: {
      totalItems: totalTransaction,
      limit,
      currentPage: page,
      totalPages: Math.ceil(totalTransaction / limit),
    },
  });
});
const getTransactionByUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = parseInt(req.params.limit) || 10;
  const sort = req.query.sort || "desc";
  const skip = (page - 1) * limit;
  const sortValues = sort === "desc" ? -1 : 1;
  const userId = req.user.id;

  const transactionQuery = TransactionModel.find({
    members: { $in: [new ObjectId(userId)] },
  })
    .populate({
      path: "transactionDetails",
      populate: {
        path: "user",
        select: "-password", // Loại bỏ trường password
      },
    })
    .populate("owner", { password: 0 }) // Loại bỏ trường password
    .sort({ date: sortValues })
    .skip(skip)
    .limit(limit)
    .lean();

  const [transaction, totalTransaction] = await Promise.all([
    transactionQuery,
    TransactionModel.countDocuments({
      members: { $in: [new ObjectId(userId)] },
    }),
  ]);

  if (!transaction) {
    res.status(403);
    throw new Error("Transaction not found");
  }

  return res.status(200).json({
    message: "Transaction found",
    transaction: transaction,
    pagination: {
      totalItems: totalTransaction,
      limit,
      currentPage: page,
      totalPages: Math.ceil(totalTransaction / limit),
    },
  });
});

const transactionController = {
  createTransaction,
  updateTransactionDetail,
  updateTransaction,
  getTransactionById,
  getTransaction,
  getTransactionByUser,
};

export default transactionController;
