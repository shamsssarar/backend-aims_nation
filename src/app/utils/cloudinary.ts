// src/app/utils/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import AppError from '../errorHelpers/AppError';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(400, 'File buffer and file name are required for upload');
  }

  const extension = fileName.split('.').pop()?.toLowerCase();

  const fileNameWithoutExtension = fileName
    .split('.')
    .slice(0, -1)
    .join('.')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

  const uniqueName = `${Math.random().toString(36).substring(2, 8)}-${Date.now()}-${fileNameWithoutExtension}`;

  const folder = extension === 'pdf' ? 'pdfs' : 'images';

  // src/app/utils/cloudinary.ts

  // src/app/utils/cloudinary.ts

  return new Promise((resolve, reject) => {
    // 1. Base options for ALL files
    const uploadOptions: any = {
      folder: `aims_nation_materials/${folder}`,
      public_id: uniqueName,
      resource_type: 'auto', // 👈 Let Cloudinary auto-detect the buffer type (Safe)
    };

    // 2. Add PDF-specific preview support without breaking the upload
    if (extension === 'pdf') {
      uploadOptions.pages = true; // 👈 Tells Cloudinary to generate image previews for PDF pages
    }

    // 3. Execute the stream
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('Cloudinary Stream Error:', error);
        return reject(new AppError(500, 'Failed to upload file to Cloudinary'));
      }
      resolve(result as UploadApiResponse);
    });

    // Write the buffer to the stream
    uploadStream.end(buffer);
  });
};
