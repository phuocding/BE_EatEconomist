import { Router } from "express";
import authRoute from "./auth.route.js";
import transactionRouter from "./transaction.route.js";

const route = Router();
route.use("/auth", authRoute);
route.use("/transaction", transactionRouter);

export default route;
