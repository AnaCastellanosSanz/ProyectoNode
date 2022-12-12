const cloudinary = require("cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (req, res, next) => {
    // Primero pasa por multer.
    if (req.file) {
        const filePath = req.file.path;
        const image = await cloudinary.v2.uploader.upload(filePath);

        //Eliminamos el archivo.
        await fs.unlinkSync(filePath);

        //Aquí pasamos la información de la url de cloudinary.
        req.file_url = image.secure_url;
        return next();
    } else {
        return next();
    }
};
//Exportamos.
module.exports = uploadToCloudinary;
