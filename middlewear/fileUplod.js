const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.fieldname !== 'image') {  // Ensure this matches the name of the file input
      return cb(new multer.MulterError('Unexpected field'), false);
    }
    cb(null, true);
  }
});


const uploadToCloudinary = (req, res, next) => {
  console.log('Files:', req.files);
  console.log('Body:', req.body);

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }).end(file.buffer);
      })
    );

    Promise.all(uploadPromises)
      .then(urls => {
        req.imageUrls = urls; 
        next();
      })
      .catch(err => {
        console.error('Error during upload:', err);
        next(err);
      });
  } else {
    next(); 
  }
};


module.exports = { upload, uploadToCloudinary };
