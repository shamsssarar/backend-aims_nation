// src/app/utils/upload.ts
import multer from 'multer';

// 👉 Tell Multer to keep the file in RAM (req.file.buffer) instead of saving it anywhere
const storage = multer.memoryStorage();

export const upload = multer({ storage });