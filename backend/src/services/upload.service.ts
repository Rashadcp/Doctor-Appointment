import s3Client from './s3';
import { Upload } from '@aws-sdk/lib-storage';

interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file buffer to AWS S3 and return the public URL.
 */
export const uploadToS3 = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> => {
  const fileExtension = originalName.split('.').pop();
  const fileName = `doctors/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

  const parallelUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME || 'dr.appointment',
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    },
  });

  await parallelUpload.done();

  const publicUrl = `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${fileName}`;

  return { url: publicUrl, key: fileName };
};
