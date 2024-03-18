import { Router } from "express";

import authController from "../controller/auth.controller.js";
// import authorization from "../middlewares/auth.mdw.js";
// import validateMdw from "../middlewares/validate.mdw.js";
// import authValidator from "../validation/auth.valid.js";

const authRoute = Router();

authRoute.post("/register", authController.register);
authRoute.post("/login", authController.login);
// authRoute.get("/current-user", authorization, authController.currentUser);

export default authRoute;
