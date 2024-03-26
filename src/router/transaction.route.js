import { Router } from "express";
import transactionController from "../controller/transaction.controller.js";
import authorizationToken from "../middlewares/auth.mdw.js";
import validateMdw from "../middlewares/validate.mdw.js";
import transactionValidSchema from "../validation/transaction.valid.js";

const transactionRouter = Router();

transactionRouter.post(
  "/create",
  authorizationToken,
  validateMdw(transactionValidSchema.transactionSchema),
  transactionController.createTransaction
);
transactionRouter.put(
  "/update-detail",
  authorizationToken,
  transactionController.updateTransactionDetail
);
transactionRouter.put(
  "/update",
  authorizationToken,
  transactionController.updateTransaction
);
transactionRouter.get(
  "/detail",
  authorizationToken,
  transactionController.getTransactionById
);
transactionRouter.get(
  "/",
  authorizationToken,
  transactionController.getTransaction
);
transactionRouter.get(
  "/byUser",
  authorizationToken,
  transactionController.getTransactionByUser
);
export default transactionRouter;
