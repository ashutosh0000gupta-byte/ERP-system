import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "niqajhrs";
const apiKey = process.env.CLOUDINARY_API_KEY || "837395475793642";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "dMS_yRJO5sA7BWRXNF9-WJD1pKM";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const isCloudinaryReady = Boolean(cloudName && apiKey && apiSecret);

export default cloudinary;
