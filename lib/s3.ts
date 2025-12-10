import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "drivermon-clips";

/**
 * Upload a video clip to S3
 */
export async function uploadVideoClip(
  tripId: string,
  clipId: string,
  file: Buffer,
  contentType: string = "video/webm",
): Promise<string> {
  const key = `clips/${tripId}/${clipId}.webm`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

/**
 * Generate a presigned URL for direct upload from client
 */
export async function getPresignedUploadUrl(
  tripId: string,
  clipId: string,
  contentType: string = "video/webm",
  expiresIn: number = 3600, // 1 hour
): Promise<string> {
  const key = `clips/${tripId}/${clipId}.webm`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get the S3 URL for a clip
 */
export function getClipUrl(tripId: string, clipId: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/clips/${tripId}/${clipId}.webm`;
}
