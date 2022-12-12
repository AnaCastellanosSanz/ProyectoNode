//Inicializamos:
const multer = require("multer");
//Con el path le digo en qué carpeta debo de guardarlo.
const path = require("path");
const createError = require("../errors/create-error");

// Array con los tipos de archivo válidos que quiero permitir guardar. Se escribe en mayúsculas ya que es algo que se va a mantener siempre igual.
const VALID_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

// Filtro de archivos
// La callback se ejecutará cn true si permitimos que ese achivo lo guarde o con false que llevará a un error y no permititrá que eese archivo pase.
const fileFilter = (req, file, cb) => {
    // file.mimetype es el campo dentro del archivo donde vamos a tener guardada la extensión de este.
    if (!VALID_FILE_TYPES.includes(file.mimetype)) {
        cb(createError("El tipo de archivo no es aceptado"));
    } else {
        // Se pone null porque no ha habido ningún error y con el true indicamos que es aceptado.
        cb(null, true);
    }
};

// ALmacen archivos.
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        //Para hacer que cada nombre de archivo sea único tenemos que poner la fecha en ese instante.
        cb(null, Date.now() + file.originalname);
    },
    //Dentro de destination añadimos la dirección donde queremos guardar nuestros archivos.
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads'));
    }
});

const upload = multer({
    storage,
    fileFilter
});

//Exportanos.
module.exports = upload;
