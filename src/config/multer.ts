import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

export const uploadAssets = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Máximo 5MB por foto
        files: 4,                  // Máximo 4 fotos
    },
    fileFilter: (req, file, cb) => {
        // Permite tipos mime de imagen o extensiones válidas de imagen
        const allowedExtensions = /jpeg|jpg|png|webp|svg|gif/;
        const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimeType = file.mimetype ? file.mimetype.startsWith('image/') : false;

        if (extName || mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WEBP, SVG).'));
        }
    },
}).array('assets', 4);// El campo en el form-data se llamará 'assets'