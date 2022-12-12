//Inicializamos:
const express = require('express');
const Movie = require('../models/Movies.js');
const createError = require('../utils/errors/create-error.js');
const isAuthPassport = require('../utils/middlewares/auth-passport.middleware.js');
const upload = require('../utils/middlewares/file.middleware.js');
const imageToUri = require('image-to-uri');
const fs = require('fs');
const uploadToCloudinary = require('../utils/middlewares/cloudinary.middleware.js');

const moviesRouter = express.Router();


//Ruta que nos permite obtener todas las películas de la base de datos.
moviesRouter.get('/', async (req, res, next) => {
    try {
        const movies = await Movie.find();
        return res.status(200).json({
            movies,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});



//Ruta que nos permite obtener los datos de una película mediante el Id.
moviesRouter.get('/:id', async (req, res, next) => {
	const id = req.params.id;
	try {
		const movie = await Movie.findById(id);
		if (movie) {
			return res.status(200).json({
                movie,
                user: req.user});
		} else {
			return res.status(404).json('No se ha encontrado ninguna película');
		}
	} catch (err) {
		next (err);
	}
});


//Ruta que nos permite que al poner unicamente /tittle aparezaca el mensaje indicado.
moviesRouter.get('/title', async (request, response, next) => {
    try{
        return response.status(200).json('Busque una película por su título');
    } catch (err) {
        next(err);
    }
});



//Ruta que nos permite obtener los datos de una película mediante el título.
moviesRouter.get('/:title', async (request, response, next) => {
    try{
        const titleMovie = request.params.title;
        const movie = await Movie.find({title: titleMovie});
        return response.status(200).json(movie);
    } catch (err) {
        next(err);
    }
});


//Ruta que nos permite obtener los datos de una película mediante el género.

moviesRouter.get('/genre/:genre', async (req, res, next) => {
    try{
        const genreMovie = req.params.genre;
        const movies = await Movie.find({genre: genreMovie});
        return res.status(200).json(movies);
    } catch (err) {
        next(err);
    }
});



//Ruta que nos permite obtener los datos de las películas que se han creado a partir del año indicado, incluyendo dicho año.
moviesRouter.get('/year/:year', async (req, res, next ) => {
	const {year} = req.params;

	try {
		const movieByYear = await Movie.find({ year: {$gte:year} });
		return res.status(200).json(movieByYear);
	} catch (err) {
        next(err);
	}
});



//Ruta que nos permite añadir una película a nuestra base de datos.
// En este caso utilizo upload.single ya que solo quiero subir un archivo, si quisiese subir varios archivos utilizaría array + nombre del campo donde van los archivos + número de archivos.
moviesRouter.post('/', [isAuthPassport, upload.single('picture')], async (req, res, next) => {
    try {
        const picture = req.file ? req.file.path : null;
        const newMovie = new Movie({ ...req.body, picture });
        const createdMovie = await newMovie.save();
        return res.status(201).json(createdMovie);
    } catch (error) {
        return next(error);
    }
});


//POST CON URI
moviesRouter.post('/with-uri', [isAuthPassport, upload.single('picture')], async (req, res, next) => {
    try {
        // file.path nos permite conocer la ruta en la que está esa imágen.
        const filePath = req.file ? req.file.path : null;
        // imageToUri devuelve el valor ya transformado en base64.
        const picture = imageToUri(filePath);
        const newMovie = new Movie({ ...req.body, picture });
        const createdMovie = await newMovie.save();
        // Eliminar el archivo subido por multer debido a que ya está guardado en la base de datos como URI.
        await fs.unlinkSync(filePath);
        return res.status(201).json(createdMovie);
    } catch (err) {
        next(err);
    }
});

//Post con Cloudinary
// El orden es importante, primero multer mes sube el archivo a la carpeta public y después uploadToCloudinary me lo sube de la carpeta public, lo sube a Cloudinary y finalmente lo elimina.
moviesRouter.post('/to-cloud', [isAuthPassport, upload.single('picture'), uploadToCloudinary], async (req, res, next) => {
    try {
        const newMovie = new Movie({ ...req.body, picture: req.file_url });
        const createdMovie = await newMovie.save();
        return res.status(201).json(createdMovie);
    } catch (err) {
        next(err);
    }
});




//Ruta que nos permite eliminar una película de nuestra base de datos mediante el Id.
moviesRouter.delete('/:id', [isAuthPassport], async (req, res, next) => {
    try {
        const id = req.params.id;
        // findByIdAndDelete permite buscar un elemento por su id y eliminarlo
        await Movie.findByIdAndDelete(id);
        return res.status(200).json('La película ha sido eliminada correctamente');
    } catch (err) {
        next(err);
    }
});


//Ruta que nos permite actualizar una película de nuestra base de datos mediante el Id.
//En este caso la he utilizado principalmente para actualizar las películas y añadirles una imágen.
moviesRouter.put('/:id', [isAuthPassport, upload.single('picture'), uploadToCloudinary], async (req, res, next) => {
    try {
        const id = req.params.id;
        // Creo documento con los datos que deseo actualizar
        const modifiedMovie = new Movie({ ...req.body, picture: req.file_url });
        // Modifico su id para que sea la misma que la que tiene actualmente
        modifiedMovie._id = id;
        // Guardo el personaje actualizado (si no pongo new a true será antes de actualizar)
        // - Id del elemento a actualizar
        // - Documento con los datos actualizados
        // - Opciones de configuración
        const movieUpdated = await Movie.findByIdAndUpdate(
            id,
            { $set: { ...modifiedMovie }},
            { new: true }
        );
        return res.status(200).json(movieUpdated);
    } catch (err) {
        next(err);
    }
});


//Exportamos
module.exports = moviesRouter;