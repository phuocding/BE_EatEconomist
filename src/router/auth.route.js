import { Router } from "express";

import authController from "../controller/auth.controller.js";
import authorizationToken from "../middlewares/auth.mdw.js";
import validateMdw from "../middlewares/validate.mdw.js";
import validateAuth from "../validation/auth.valid.js";
import uploadMdw from "../middlewares/upload.mdw.js";

const authRoute = Router();

authRoute.post(
  "/register",
  validateMdw(validateAuth.registerSchema),
  authController.register
);
authRoute.post(
  "/login",
  validateMdw(validateAuth.loginSchema),
  authController.login
);
authRoute.get(
  "/current-user",
  authorizationToken,
  authController.getCurrentUser
);
authRoute.get("/user-list", authorizationToken, authController.getUserList);
authRoute.put(
  "/current-user",
  authorizationToken,
  authController.updateCurrentUser
);

authRoute.post(
  "/uppdate-avatar",
  authorizationToken,
  uploadMdw.single("avatar"),
  authController.updateAvatar
);

export default authRoute;
