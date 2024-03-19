import { Router } from "express";

import authController from "../controller/auth.controller.js";
import authorizationToken from "../middlewares/auth.mdw.js";

const authRoute = Router();

authRoute.post("/register", authController.register);
authRoute.post("/login", authController.login);
authRoute.get(
  "/current-user",
  authorizationToken,
  authController.getCurrentUser
);

export default authRoute;
