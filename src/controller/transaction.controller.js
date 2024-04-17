import asyncHandler from "express-async-handler";
import TransactionModel from "../models/transaction.js";
import TransactionDetailModel from "../models/transactionDetail.js";
import { ObjectId } from "mongodb";
import teleBot from "../utils/tele.bot.js";

const caculateDebitAmount = (transaction, transactionDetails) => {
  let updateTransactionDetails;
  if (transaction.type == "uneven") {
    const discountPercent = transaction.discount / transaction.amount;
    updateTransactionDetails = transactionDetails.map((detail) => ({
      ...detail,
      debitAmount: detail.moneyDetail * (1 - discountPercent),
    }));
  } else if (transaction.type == "uniform") {
    const debitAmount =
      (transaction.amount - transaction.discount) / transactionDetails.length;
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

  const transaction = {
    amount,
    discount,
    type,
  };

  const newTransactionDetails = caculateDebitAmount(
    transaction,
    transactionDetail
  );
  const insertedTransactionDetail = await TransactionDetailModel.insertMany(
    newTransactionDetails
  );

  if (!insertedTransactionDetail) {
    res.status(400);
    throw new Error("Create transactiondetail failed");
  }

  const members = insertedTransactionDetail.map((item) => item.user);
  const transactionDetails = insertedTransactionDetail.map((item) => item._id);

  const owner = req.user.id;
  const newTransaction = await TransactionModel.create({
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

  const alo = await newTransaction.populate("owner");
  // Giả sử `_id` có sẵn và bạn có thể lấy theo các ID này
  const ids = insertedTransactionDetail.map((detail) => detail._id);
  const populatedDetails = await TransactionDetailModel.find({
    _id: { $in: ids },
  }).populate("user");

  teleBot.sendToTeleBot(teleBot.createMessage(alo, populatedDetails));

  res.status(201).json({
    message: "Transaction created successfully",
    newTransaction,
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
      ).populate("user");

    teleBot.sendToTeleBot(
      teleBot.paymentSuccessMessage(updatedTransactionDetail)
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
  const limit = parseInt(req.params.limit) || 100;
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

  const transactionUpdated = transaction.map((tran) => {
    return {
      ...tran,
      transactionDetailAffterMap: caculateDebitAmount(
        tran,
        tran.transactionDetails
      ),
    };
  });

  return res.status(200).json({
    message: "Transaction found",
    transaction: transactionUpdated,
    pagination: {
      totalItems: totalTransaction,
      limit,
      currentPage: page,
      totalPages: Math.ceil(totalTransaction / limit),
    },
  });
});
const getAmountDebitByMonth = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const month = req.query.month || new Date().getMonth() + 1;
  const year = req.query.year || new Date().getFullYear();
  var amountDebit = 0;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const transactionDetailsList = await TransactionDetailModel.find({
    createdAt: { $gte: startDate, $lte: endDate },
    user: userId,
  }).lean();

  if (!transactionDetailsList) {
    res.status(404);
    throw new Error("TransactionDetail not found");
  }
  transactionDetailsList.forEach((tran) => {
    amountDebit += tran.debitAmount;
  });

  res.status(200).json({ data: transactionDetailsList, amountDebit });
});

const transactionController = {
  createTransaction,
  updateTransactionDetail,
  updateTransaction,
  getTransactionById,
  getTransaction,
  getTransactionByUser,
  getAmountDebitByMonth,
};

export default transactionController;
