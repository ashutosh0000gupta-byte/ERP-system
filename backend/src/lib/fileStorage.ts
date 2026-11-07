import path from "path";
import crypto from "crypto";
import fs from "fs";
import { Readable } from "stream";
import minioClient, { MINIO_BUCKET, ensureMinioBucket } from "../config/minio";
import cloudinary, { isCloudinaryReady } from "../config/cloudinary";

export interface SavedFileResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

const LOCAL_UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

/**
 * Upload helper using Cloudinary stream
 */
async function uploadStreamToCloudinary(
  file: Express.Multer.File,
  folder: string
): Promise<{ secure_url: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const isRaw = file.mimetype?.includes("pdf") ||
      file.originalname?.match(/\.(pdf|xlsx|xls|csv|doc|docx|zip)$/i);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `hrms/${folder}`,
        resource_type: isRaw ? "raw" : "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          secure_url: result.secure_url,
          bytes: result.bytes || 0,
        });
      }
    );

    if (file.buffer) {
      Readable.from(file.buffer).pipe(stream);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.createReadStream(file.path).pipe(stream);
    } else {
      reject(new Error("File content is empty"));
    }
  });
}

/**
 * Save an uploaded file by uploading to Cloudinary, with automatic fallback to MinIO and local disk.
 */
export async function saveUploadedFile(
  folder: "avatars" | "documents",
  file: Express.Multer.File
): Promise<SavedFileResult> {
  const ext = path.extname(file.originalname) || (file.mimetype.includes("png") ? ".png" : ".jpg");
  const uniqueName = `${folder === "avatars" ? "avatar" : "doc"}-${crypto.randomUUID()}${ext}`;
  const fileSize = file.size || (file.path && fs.existsSync(file.path) ? fs.statSync(file.path).size : 0);

  // 1. Prefer Cloudinary (25 GB permanent free cloud storage)
  if (isCloudinaryReady) {
    try {
      const cloudRes = await uploadStreamToCloudinary(file, folder);
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      return {
        fileUrl: cloudRes.secure_url,
        fileName: file.originalname || uniqueName,
        fileSize: cloudRes.bytes || fileSize,
        mimeType: file.mimetype || "application/octet-stream",
      };
    } catch (cloudErr) {
      console.warn("[FileStorage] Cloudinary upload failed, falling back:", (cloudErr as Error)?.message);
    }
  }

  // 2. Try streaming to MinIO second
  const minioObjectName = `${folder}/${uniqueName}`;
  const fileUrl = `/uploads/${folder}/${uniqueName}`;

  try {
    await ensureMinioBucket();

    let stream: Readable;
    if (file.buffer) {
      stream = Readable.from(file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      stream = fs.createReadStream(file.path);
    } else {
      throw new Error("No file content found");
    }

    await minioClient.putObject(
      MINIO_BUCKET,
      minioObjectName,
      stream,
      fileSize,
      { "Content-Type": file.mimetype || "application/octet-stream" }
    );

    // Cleanup temp multer file if present
    if (file.path && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch {}
    }

    return {
      fileUrl,
      fileName: file.originalname || uniqueName,
      fileSize,
      mimeType: file.mimetype,
    };
  } catch (minioErr) {
    // 3. Fallback to local uploads directory when Docker/MinIO is not running
    console.warn("[FileStorage] MinIO offline or unreachable. Falling back to local storage:", (minioErr as Error)?.message);

    const targetDir = path.join(LOCAL_UPLOADS_ROOT, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, uniqueName);

    if (file.buffer) {
      fs.writeFileSync(targetPath, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, targetPath);
      try { fs.unlinkSync(file.path); } catch {}
    }

    return {
      fileUrl,
      fileName: file.originalname || uniqueName,
      fileSize,
      mimeType: file.mimetype,
    };
  }
}

/**
 * Delete a previously stored file (from Cloudinary, MinIO, or local fallback).
 */
export async function deleteStoredFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  // Attempt Cloudinary deletion
  if (fileUrl.includes("res.cloudinary.com")) {
    try {
      const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (match && match[1]) {
        const publicId = match[1];
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      }
    } catch (e) {
      console.warn("[FileStorage] Cloudinary file deletion failed:", (e as Error)?.message);
    }
    return;
  }

  if (!fileUrl.startsWith("/uploads/")) return;

  const relativePath = fileUrl.replace(/^\/uploads\//, "");

  // Attempt MinIO deletion
  try {
    await minioClient.removeObject(MINIO_BUCKET, relativePath);
  } catch {
    // Attempt local file cleanup
    try {
      const localFilePath = path.join(LOCAL_UPLOADS_ROOT, relativePath);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch {}
  }
}
