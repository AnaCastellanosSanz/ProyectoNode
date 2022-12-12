//Inicializamos:
const express = require('express');
const Cinema = require('../models/Cinema.js');
const createError = require('../utils/errors/create-error.js');
const isAuthPassport = require('../utils/middlewares/auth-passport.middleware.js');


const cinemaRouter = express.Router();



//Ruta que obtiene todos los cines de la base de datos.
cinemaRouter.get('/', async (req, res, next) => {
	try {
		const cinemas = await Cinema.find().populate('movies');
		return res.status(200).json(cinemas)
	} catch (error) {
		return next(error)
	}
});


//Ruta que permite añadir un nuevo cine en la base de datos.
cinemaRouter.post('/', [isAuthPassport], async (req, res, next) => {
    try {
        const newCinema = new Cinema({ ...req.body });
        const createdCinema = await newCinema.save();
        return res.status(201).json(createdCinema);
    } catch (error) {
        return next(error);
    }
});


//Ruta que permite añadir una nueva película a la base de datos.
cinemaRouter.put('/add-movie', [isAuthPassport], async (req, res, next) => {
    try {
        const { cinemaId, movieId } = req.body;
        if (!cinemaId){
            return next (createError('Se necesita un id de cine', 500)); 
        }
        if (!movieId){
            return next (createError('Se necesita un id de película', 500)); 
        }
        const updatedCinema = await Cinema.findByIdAndUpdate(
            cinemaId,
            { $push: { movies: movieId } },
            { new: true }
        );
        return res.status(200).json(updatedCinema);
    } catch (error) {
        return next(error);
    }
});


//Ruta que permite actualizar los datos de un cine mendiante el id.
cinemaRouter.put('/:id', [isAuthPassport], async (req, res, next) => {
    try {
        const id = req.params.id;
        // Creo documento con los datos que deseo actualizar
        const modifiedCinema = new Cinema({ ...req.body });
        // Modifico su id para que sea la misma que la que tiene actualmente
        modifiedCinema._id = id;
        // Guardo el personaje actualizado (si no pongo new a true será antes de actualizar)
        // - Id del elemento a actualizar
        // - Documento con los datos actualizados
        // - Opciones de configuración
        const cinemaUpdated = await Cinema.findByIdAndUpdate(
            id,
            { $set: { ...modifiedCinema }},
            { new: true }
        );
        return res.status(200).json(cinemaUpdated);
    } catch (err) {
        next(err);
    }
});


//Exportamos
module.exports = cinemaRouter;
