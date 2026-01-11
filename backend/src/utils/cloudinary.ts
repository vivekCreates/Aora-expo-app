import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


const uploadOnCloudinary = async(localFilePath:string)=>{
    try {
        if(localFilePath === ''){
            console.log('No file path provided for upload.');
            return;
        }

        const uploadResult = await cloudinary.uploader.upload(
           localFilePath, {
               public_id: 'Aora-expo',
           }
       );
       if(uploadResult){
        return uploadResult.secure_url;
       }
    } catch (error) {
        console.log('Error uploading to Cloudinary:', error);
    }

}

export default uploadOnCloudinary;