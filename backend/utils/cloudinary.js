const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Ensure env vars are loaded even if this file is required by a script
dotenv.config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (fileBuffer, returnDetailed = false) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'promptova' },
      (error, result) => {
        if (error) return reject(error);
        if (returnDetailed) {
          resolve({
            secure_url: result.secure_url,
            width: result.width,
            height: result.height
          });
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadToCloudinary };
