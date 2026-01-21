const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicIdFromUrl = (url) => {
  try {
    const splitUrl = url.split('/');
    const lastSegment = splitUrl.pop();     
    const folderSegment = splitUrl.pop();    
    const publicId = lastSegment.split('.')[0];
    return publicId; 
  } catch (error) {
    console.error("Error extracting publicId", error);
    return null;
  }
};

const deleteImage = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Cloudinary Deleted: ${publicId}`);
  } catch (err) {
    console.error(`⚠️ Failed to delete ${publicId}:`, err.message);
  }
};

module.exports = { deleteImage };