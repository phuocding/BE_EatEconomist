import "dotenv/config.js";
import express from "express";
import cors from "cors";
import route from "./src/router/index.js";
import connectDatabase from "./src/database/db.js";
import handleErrorMiddleware from "./src/middlewares/handleError.mdw.js";
import authController from "./src/controller/auth.controller.js";

const app = express();
const corsOptins = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptins));
const PORT = process.env.PORT || 3014;

//1 Initialized database
connectDatabase();
//2 Define middleware
app.use(express.json());
//3 Define routes

// app.use("/api/v1", route);
app.post("/register", authController.register);
app.get("/", (req, res) => {
  res.status(200).json({ message: "welcome to NVC" });
});
//4 Handle Error
app.use(handleErrorMiddleware);
//5 Run Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
