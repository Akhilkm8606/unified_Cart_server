const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to upload images to Cloudinary
const uploadToCloudinary = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }).end(file.buffer);
      })
    );

    Promise.all(uploadPromises)
      .then(urls => {
        req.imageUrls = urls; // Attach image URLs to the request object
        next();
      })
      .catch(err => next(err));
  } else {
    next(); // No files to upload
  }
};

module.exports = { upload, uploadToCloudinary };
