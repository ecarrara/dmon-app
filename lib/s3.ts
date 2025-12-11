import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_DOMAIN = process.env.S3_DOMAIN || "your-objectstorage.com";
const S3_REGION = process.env.S3_REGION || "fsn1";
const BUCKET_NAME = process.env.S3_BUCKET || "dmon-clips";
const S3_ENDPOINT = `https://${S3_REGION}.${S3_DOMAIN}`;

const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for S3-compatible services
});

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

  return `https://${BUCKET_NAME}.${S3_REGION}.your-objectstorage.com/${key}`;
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
  return `https://${BUCKET_NAME}.${S3_REGION}.${S3_DOMAIN}/clips/${tripId}/${clipId}.webm`;
}

/**
 * Upload an event image to S3
 */
export async function uploadEventImage(
  tripId: string,
  eventId: string,
  file: Buffer,
  contentType: string = "image/jpeg",
): Promise<string> {
  const key = `events/${tripId}/${eventId}.jpg`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  return `https://${BUCKET_NAME}.${S3_REGION}.${S3_DOMAIN}/${key}`;
}

/**
 * Get the S3 URL for an event image
 */
export function getEventImageUrl(tripId: string, eventId: string): string {
  return `https://${BUCKET_NAME}.${S3_REGION}.${S3_DOMAIN}/events/${tripId}/${eventId}.jpg`;
}

/**
 * Generate a presigned URL for downloading from S3
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 7200, // 2 hours
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get a presigned download URL for a video clip
 */
export async function getPresignedClipUrl(
  tripId: string,
  clipId: string,
): Promise<string> {
  const key = `clips/${tripId}/${clipId}.webm`;
  return getPresignedDownloadUrl(key);
}

/**
 * Get a presigned download URL for an event image
 */
export async function getPresignedEventImageUrl(
  tripId: string,
  eventId: string,
): Promise<string> {
  const key = `events/${tripId}/${eventId}.jpg`;
  return getPresignedDownloadUrl(key);
}
