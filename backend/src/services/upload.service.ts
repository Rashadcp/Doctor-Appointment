import s3Client from './s3';
import { Upload } from '@aws-sdk/lib-storage';
import sharp from 'sharp';

interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file buffer to AWS S3 and return the public URL.
 * Optimized with sharp to resize and compress images before storage.
 */
export const uploadToS3 = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> => {
  // Pre-optimize image: Resize to max-width 1000px and convert to WebP
  // This significantly reduces S3 storage and Next.js optimization time
  let optimizedBuffer = buffer;
  let finalMimeType = mimeType;
  let finalExtension = originalName.split('.').pop();

  if (mimeType.startsWith('image/')) {
    optimizedBuffer = await sharp(buffer)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    
    finalMimeType = 'image/webp';
    finalExtension = 'webp';
  }

  const fileName = `doctors/${Date.now()}-${Math.random().toString(36).substring(7)}.${finalExtension}`;

  const parallelUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME || 'dr.appointment',
      Key: fileName,
      Body: optimizedBuffer,
      ContentType: finalMimeType,
      ACL: 'public-read',
    },
  });

  await parallelUpload.done();

  const publicUrl = `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${fileName}`;

  return { url: publicUrl, key: fileName };
};

