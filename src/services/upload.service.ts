import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class BaseCloudinaryUpload {
    protected static uploadToFolder(fileBuffer: Buffer, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result?.secure_url) {
                        return reject(new Error('Respuesta inválida de Cloudinary'));
                    }
                    resolve(result.secure_url);
                }
            );

            uploadStream.end(fileBuffer);
        });
    }
}

export class UploadService extends BaseCloudinaryUpload {
    static async uploadBuffer(fileBuffer: Buffer): Promise<string> {
        return this.uploadToFolder(fileBuffer, 'creayapp_user_assets');
    }
}

export class UploadServiceAdmin extends BaseCloudinaryUpload {
    static async uploadBuffer(fileBuffer: Buffer): Promise<string> {
        return this.uploadToFolder(fileBuffer, 'creayapp_admin_assets');
    }
}