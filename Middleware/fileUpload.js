import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

dotenv.config();

const s3 = new S3Client({
  credentials: {
    secretAccessKey: process.env.S3_SECRET_KEY ,
    accessKeyId: process.env.S3_ACCESS_KEY
  },
  region: "eu-north-1"
});

const storage = multerS3({
  s3: s3,
  bucket: "codeblues",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, Date.now().toString());
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Files only (jpeg, jpg, png, gif, mp4, mov, pdf)!');
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export const uploadMiddleWare = upload;
