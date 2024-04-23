import multer from "multer";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";

// if (!fs.existsSync("uploads")) {
//   fs.mkdirSync("uploads");
// }

const multerConfig = multer.memoryStorage();

// const multerConfig = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = uuidv4();
//     const fileExtension = file.originalname.split(".").pop();
//     const fileName = `${file.originalname}-${uniqueSuffix}.${fileExtension}`;
//     req.file = fileName;
//     cb(null, uuidv4() + "-" + file.originalname);
//   },
// });

export default multerConfig;
