import fs from "fs";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dibhmlbrg",
  api_key: "824111575292356",
  api_secret: "gWBrBjE7nlyfd9Jh6W10NCpYGqk",
});

const uploadSingleFile = (filePath, folder = "EatEconomics") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: "auto",
        folder: folder,
        transformation: [
          { width: 1500, height: 1500, crop: "thumb", gravity: "face" },
        ],
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            resource_type: result.resource_type,
          });
        }
      }
    );
  });
};

const CloudinaryService = { uploadSingleFile };

export default CloudinaryService;
