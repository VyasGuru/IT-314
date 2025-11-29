import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with details stored in environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_CLOUD_KEY,      // your API key
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET // your API secret
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // If no file path is given, stop here
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto" // auto-detect file type (image, video, etc.)
    });

    // If upload is successful, print the Cloudinary URL
    console.log("File is uploaded to Cloudinary:", response.url);

    // Attempt to delete the local file to free up disk space
    try {
      await fs.promises.unlink(localFilePath);
      console.log("Deleted local file after upload:", localFilePath);
    } catch (unlinkErr) {
      console.warn("Failed to delete local file after Cloudinary upload:", localFilePath, unlinkErr.message || unlinkErr);
    }

    // Return the upload response (includes file URL and other info)
    return response;
  } catch (error) {
    // If upload fails, try to delete the temporary local file, then rethrow
    try {
      if (localFilePath && fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
        console.log("Deleted local file after failed upload:", localFilePath);
      }
    } catch (cleanupErr) {
      console.warn("Failed to cleanup local file after failed upload:", cleanupErr.message || cleanupErr);
    }
    throw error;
  }
};

// Function to delete a file from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return null;

        // Extract the public_id from the URL
      
        const publicId = imageUrl.split('/').pop().split('.')[0];
        
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        
        console.log("Deleted image from Cloudinary:", publicId);
        return true;

    } catch (error) {
        console.log("Error deleting from Cloudinary:", error);
        return false;
    }
}

// Export the function so it can be used in other files
export { uploadOnCloudinary, deleteFromCloudinary };
